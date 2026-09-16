const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'aelp_station.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to SQLite DB:', err.message);
    } else {
        console.log('Connected to AELP SQLite Database at:', DB_PATH);
        initDatabase();
    }
});

function initDatabase() {
    const schemaPath = path.join(__dirname, 'src', 'main', 'resources', 'schema.sql');
    const dataPath = path.join(__dirname, 'src', 'main', 'resources', 'data.sql');

    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql, (err) => {
            if (err) console.error('Error applying schema.sql:', err);
            else {
                console.log('Schema initialized successfully.');
                if (fs.existsSync(dataPath)) {
                    const dataSql = fs.readFileSync(dataPath, 'utf8');
                    db.exec(dataSql, (err2) => {
                        if (err2) console.error('Error seeding data.sql:', err2);
                        else console.log('Seed data initialized successfully.');
                    });
                }
            }
        });
    }
}

// Global Satellite Status State
let satelliteOnline = false;

// Helper function to append to sync_queue
function queueSyncDelta(tableName, recordId, operation, payload) {
    const syncId = 'sync-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const sql = `INSERT INTO sync_queue (id, table_name, record_id, operation, payload_json, synced_boolean, created_at, retry_count)
                 VALUES (?, ?, ?, ?, ?, 0, datetime('now'), 0)`;
    db.run(sql, [syncId, tableName, recordId, operation, JSON.stringify(payload)], (err) => {
        if (err) console.error('Failed to queue sync delta:', err.message);
    });
}

// --- API ENDPOINTS ---

// Dashboard Stats
app.get('/api/stats', (req, res) => {
    const stats = {};

    db.get(`SELECT COUNT(*) as count FROM personnel WHERE current_status = 'IN_FIELD'`, [], (err, row1) => {
        stats.activeFieldPersonnel = row1 ? row1.count : 0;

        db.get(`SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= reorder_threshold`, [], (err, row2) => {
            stats.lowStockItems = row2 ? row2.count : 0;

            db.get(`SELECT COUNT(*) as count FROM incidents WHERE status != 'RESOLVED'`, [], (err, row3) => {
                stats.openIncidents = row3 ? row3.count : 0;

                db.get(`SELECT COUNT(*) as count FROM expeditions WHERE status IN ('APPROVED', 'ACTIVE')`, [], (err, row4) => {
                    stats.activeExpeditions = row4 ? row4.count : 0;

                    db.get(`SELECT COUNT(*) as count FROM sync_queue WHERE synced_boolean = 0`, [], (err, row5) => {
                        stats.pendingSyncCount = row5 ? row5.count : 0;
                        stats.satelliteOnline = satelliteOnline;
                        res.json(stats);
                    });
                });
            });
        });
    });
});

// Expeditions API
app.get('/api/expeditions', (req, res) => {
    db.all(`SELECT e.*, r.name as route_name, r.distance_km, r.waypoints_json, p.name as team_lead_name 
            FROM expeditions e 
            LEFT JOIN routes r ON e.route_id = r.id 
            LEFT JOIN personnel p ON e.team_lead_id = p.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/expeditions', (req, res) => {
    const { name, start_date, end_date, route_id, team_lead_id, objectives, required_permits, team_size, duration_days, distance_km } = req.body;
    const id = 'exp-' + Date.now();

    // Resource Calculator Formula:
    // Fuel: 0.8 Liters per Km per vehicle (assuming 2 vehicles) = 1.6 L/km * distance
    // Food: 4000 kcal per person per day
    const calculated_fuel = Math.round(distance_km * 1.6 * 1.25); // 25% safety margin
    const calculated_rations = Math.round(team_size * duration_days * 4000);

    const riskAssessment = JSON.stringify({
        weatherWindow: "CHECK_PENDING",
        crevasseRisk: distance_km > 500 ? "HIGH" : "MODERATE",
        fuelMarginPct: 25,
        radioCheckIntervalMinutes: 120
    });

    const sql = `INSERT INTO expeditions (id, name, start_date, end_date, status, route_id, team_lead_id, objectives, risk_assessment_json, required_permits, calculated_fuel_liters, calculated_rations_kcal)
                 VALUES (?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [id, name, start_date, end_date, route_id, team_lead_id, objectives, riskAssessment, required_permits, calculated_fuel, calculated_rations], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const newExpedition = { id, name, start_date, end_date, status: 'DRAFT', calculated_fuel_liters: calculated_fuel, calculated_rations_kcal: calculated_rations };
        queueSyncDelta('expeditions', id, 'INSERT', newExpedition);
        res.json(newExpedition);
    });
});

app.put('/api/expeditions/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    db.run(`UPDATE expeditions SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        queueSyncDelta('expeditions', id, 'UPDATE', { id, status });
        res.json({ success: true, id, status });
    });
});

// Cargo & Barcode API
app.get('/api/cargo', (req, res) => {
    db.all(`SELECT c.*, s.manifest_ref, s.origin, s.destination, s.transport_mode, s.priority 
            FROM cargo_items c 
            LEFT JOIN cargo_shipments s ON c.shipment_id = s.id`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/cargo/scan', (req, res) => {
    const { barcode, location, actor, newStatus } = req.body;

    db.get(`SELECT * FROM cargo_items WHERE barcode = ?`, [barcode], (err, item) => {
        if (err || !item) return res.status(404).json({ error: 'Cargo item barcode not found: ' + barcode });

        let custody = [];
        try { custody = JSON.parse(item.chain_of_custody_json || '[]'); } catch(e){}
        custody.push({
            event: `Scanned at ${location || 'Checkpoint'} (${newStatus || 'Status Update'})`,
            actor: actor || 'Logistics Officer',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });

        const status = newStatus || 'STAGED_AT_STATION';
        const updatedCustody = JSON.stringify(custody);

        db.run(`UPDATE cargo_items SET status = ?, chain_of_custody_json = ? WHERE id = ?`, [status, updatedCustody, item.id], function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });

            // Cross-reference: auto populate / adjust inventory if medical or food
            if (status === 'STAGED_AT_STATION') {
                const invId = 'inv-auto-' + Date.now();
                db.run(`INSERT OR IGNORE INTO inventory_items (id, name, category, quantity, unit, expiry_date, reorder_threshold, location, barcode)
                        VALUES (?, ?, ?, ?, 'Units', '2027-12-31', 5.0, ?, ?)`,
                        [invId, item.description, item.category, 10, 'Main Station Store', barcode]);
            }

            queueSyncDelta('cargo_items', item.id, 'UPDATE', { id: item.id, status, chain_of_custody_json: updatedCustody });
            res.json({ success: true, item: { ...item, status, chain_of_custody_json: updatedCustody } });
        });
    });
});

app.post('/api/cargo', (req, res) => {
    const { description, category, weight_kg, volume_m3, shipment_id, handling_instructions } = req.body;
    const id = 'item-' + Date.now();
    const barcode = 'CRG-' + category.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const custody = JSON.stringify([{ event: 'Created & Tagged with QR', actor: 'Logistics Officer', timestamp: new Date().toISOString() }]);

    const sql = `INSERT INTO cargo_items (id, shipment_id, description, category, weight_kg, volume_m3, barcode, status, handling_instructions, chain_of_custody_json)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'PACKED', ?, ?)`;

    db.run(sql, [id, shipment_id || 'shp-2026-01', description, category, weight_kg, volume_m3, barcode, handling_instructions, custody], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const newItem = { id, description, category, weight_kg, volume_m3, barcode, status: 'PACKED' };
        queueSyncDelta('cargo_items', id, 'INSERT', newItem);
        res.json(newItem);
    });
});

// Inventory API
app.get('/api/inventory', (req, res) => {
    db.all(`SELECT * FROM inventory_items`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/inventory/transaction', (req, res) => {
    const { item_id, change_qty, reason, related_expedition_id, user_id } = req.body;
    const txId = 'tx-' + Date.now();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.get(`SELECT * FROM inventory_items WHERE id = ?`, [item_id], (err, item) => {
        if (err || !item) return res.status(404).json({ error: 'Item not found' });

        let newQty = item.quantity;
        let newReserved = item.reserved_qty || 0;

        if (reason === 'EXPEDITION_RESERVE') {
            newReserved += parseFloat(change_qty);
        } else {
            newQty += parseFloat(change_qty);
        }

        db.run(`UPDATE inventory_items SET quantity = ?, reserved_qty = ? WHERE id = ?`, [newQty, newReserved, item_id], function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });

            db.run(`INSERT INTO inventory_transactions (id, item_id, change_qty, reason, related_expedition_id, timestamp, user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`, [txId, item_id, change_qty, reason, related_expedition_id || null, timestamp, user_id || 'usr-02']);

            queueSyncDelta('inventory_items', item_id, 'UPDATE', { id: item_id, quantity: newQty, reserved_qty: newReserved });
            res.json({ success: true, item_id, newQuantity: newQty, newReservedQty: newReserved });
        });
    });
});

// Personnel & Field Movement API
app.get('/api/personnel', (req, res) => {
    db.all(`SELECT * FROM personnel`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/personnel/movement', (req, res) => {
    const { personnel_id, event_type, location, expected_return, notes } = req.body;
    const logId = 'pml-' + Date.now();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let newStatus = 'AT_STATION';
    if (event_type === 'CHECK_OUT') newStatus = 'IN_FIELD';
    else if (event_type === 'CHECK_IN') newStatus = 'AT_STATION';

    db.run(`UPDATE personnel SET current_status = ?, current_location = ?, last_checkin = ? WHERE id = ?`,
           [newStatus, location, timestamp, personnel_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(`INSERT INTO personnel_movement_log (id, personnel_id, event_type, location, timestamp, expected_return, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)`, [logId, personnel_id, event_type, location, timestamp, expected_return || null, notes || '']);

        queueSyncDelta('personnel', personnel_id, 'UPDATE', { id: personnel_id, current_status: newStatus, current_location: location });
        res.json({ success: true, personnel_id, newStatus, location, timestamp });
    });
});

// Emergency Response API (ONE-CLICK INCIDENT & AUTO-SKILL MATCHING)
app.get('/api/incidents', (req, res) => {
    db.all(`SELECT * FROM incidents ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/incidents', (req, res) => {
    const { type, severity, location, description } = req.body;
    const id = 'inc-' + Date.now();
    const createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Auto-pull skilled personnel based on incident type
    let skillQuery = '%Medical%';
    if (type === 'CREVASSE_FALL' || type === 'LOST_PERSONNEL') skillQuery = '%Crevasse%';
    else if (type === 'MECHANICAL_FAILURE') skillQuery = '%Snowcat%';

    db.all(`SELECT * FROM personnel WHERE certifications_json LIKE ?`, [skillQuery], (err, skilledTeam) => {
        const assignedIds = (skilledTeam || []).map(p => p.id);
        const assignedJson = JSON.stringify(assignedIds);

        const sql = `INSERT INTO incidents (id, type, severity, location, status, created_at, incident_commander_id, description, assigned_team_json)
                     VALUES (?, ?, ?, ?, 'OPEN', ?, 'usr-01', ?, ?)`;

        db.run(sql, [id, type, severity, location, createdAt, description, assignedJson], function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });

            // Create initial incident log
            const logId = 'inc-log-' + Date.now();
            db.run(`INSERT INTO incident_log (id, incident_id, timestamp, actor_id, action_note)
                    VALUES (?, ?, ?, 'usr-01', ?)`, [logId, id, createdAt, `INCIDENT CREATED: ${type} at ${location}. Auto-matched ${assignedIds.length} qualified personnel.`]);

            const newIncident = { id, type, severity, location, status: 'OPEN', created_at: createdAt, description, assigned_team: skilledTeam };
            queueSyncDelta('incidents', id, 'INSERT', newIncident);
            res.json(newIncident);
        });
    });
});

app.put('/api/incidents/:id/resolve', (req, res) => {
    const { id } = req.params;
    const resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.run(`UPDATE incidents SET status = 'RESOLVED', resolved_at = ? WHERE id = ?`, [resolvedAt, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        queueSyncDelta('incidents', id, 'UPDATE', { id, status: 'RESOLVED', resolved_at: resolvedAt });
        res.json({ success: true, id, status: 'RESOLVED' });
    });
});

// Satellite Sync & Queue Engine API
app.get('/api/sync/queue', (req, res) => {
    db.all(`SELECT * FROM sync_queue WHERE synced_boolean = 0 ORDER BY created_at ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/sync/toggle', (req, res) => {
    satelliteOnline = !satelliteOnline;
    res.json({ satelliteOnline });
});

app.post('/api/sync/process', (req, res) => {
    if (!satelliteOnline) {
        return res.status(400).json({ error: 'Satellite connection is currently OFFLINE. Cannot sync with HQ server.' });
    }

    db.all(`SELECT * FROM sync_queue WHERE synced_boolean = 0`, [], (err, rows) => {
        if (err || !rows || rows.length === 0) return res.json({ syncedCount: 0, message: 'Sync queue is clear.' });

        const ids = rows.map(r => r.id);
        const placeholders = ids.map(() => '?').join(',');

        db.run(`UPDATE sync_queue SET synced_boolean = 1 WHERE id IN (${placeholders})`, ids, function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ syncedCount: rows.length, syncedIds: ids });
        });
    });
});

// Database Rolling Backup
app.post('/api/backups', (req, res) => {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const backupFile = path.join(backupDir, `aelp_backup_${Date.now()}.db`);
    fs.copyFile(DB_PATH, backupFile, (err) => {
        if (err) return res.status(500).json({ error: 'Backup failed: ' + err.message });
        res.json({ success: true, backupFile: path.basename(backupFile), timestamp: new Date().toISOString() });
    });
});

app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` AELP Station Server is LIVE on http://localhost:${PORT}`);
    console.log(` Deployment Mode: Station LAN / Standalone Embedded SQLite`);
    console.log(`================================================================`);
});
