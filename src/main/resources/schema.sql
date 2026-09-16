-- Antarctica Expedition & Logistics Platform (AELP) Schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- STATION_COMMAND, LOGISTICS_OFFICER, FIELD_LEAD, MEDICAL_OFFICER
    password_hash TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    waypoints_json TEXT NOT NULL,
    distance_km REAL NOT NULL,
    hazard_notes TEXT
);

CREATE TABLE IF NOT EXISTS expeditions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL, -- DRAFT, REVIEWED, APPROVED, ACTIVE, COMPLETED, ABORTED
    route_id TEXT,
    team_lead_id TEXT,
    objectives TEXT,
    risk_assessment_json TEXT,
    required_permits TEXT,
    calculated_fuel_liters REAL,
    calculated_rations_kcal REAL,
    FOREIGN KEY(route_id) REFERENCES routes(id)
);

CREATE TABLE IF NOT EXISTS personnel (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    certifications_json TEXT, -- ["Medical", "Crevasse Rescue", "Snowcat Ops", "Radio Comms"]
    current_status TEXT NOT NULL, -- AT_STATION, IN_FIELD, IN_TRANSIT, OFF_CONTINENT
    current_location TEXT NOT NULL,
    emergency_contact TEXT,
    blood_type TEXT,
    last_checkin TEXT,
    password TEXT NOT NULL DEFAULT 'pass123'
);

CREATE TABLE IF NOT EXISTS personnel_movement_log (
    id TEXT PRIMARY KEY,
    personnel_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- CHECK_OUT, CHECK_IN, OVERDUE_FLAG, TRANSIT_UPDATE
    location TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    expected_return TEXT,
    expedition_id TEXT,
    notes TEXT,
    FOREIGN KEY(personnel_id) REFERENCES personnel(id)
);

CREATE TABLE IF NOT EXISTS cargo_shipments (
    id TEXT PRIMARY KEY,
    manifest_ref TEXT NOT NULL UNIQUE,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT NOT NULL, -- ORDERED, IN_TRANSIT, ARRIVED, STAGED, DEPLOYED
    transport_mode TEXT NOT NULL, -- RESUPPLY_VESSEL, FLIGHT, TRAVERSE_CONVOY
    eta TEXT,
    priority TEXT NOT NULL -- NORMAL, HIGH, MEDICAL, PERISHABLE, HAZMAT
);

CREATE TABLE IF NOT EXISTS cargo_items (
    id TEXT PRIMARY KEY,
    shipment_id TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    volume_m3 REAL NOT NULL,
    barcode TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL, -- PACKED, IN_TRANSIT, STAGED_AT_STATION, FIELD_ALLOCATED
    handling_instructions TEXT,
    chain_of_custody_json TEXT,
    damage_reported INTEGER DEFAULT 0,
    damage_notes TEXT,
    FOREIGN KEY(shipment_id) REFERENCES cargo_shipments(id)
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- FOOD, FUEL, MEDICAL, SCIENTIFIC, SPARE_PARTS, SAFETY_GEAR
    quantity REAL NOT NULL,
    reserved_qty REAL DEFAULT 0,
    unit TEXT NOT NULL,
    expiry_date TEXT,
    reorder_threshold REAL NOT NULL,
    location TEXT NOT NULL,
    barcode TEXT
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    change_qty REAL NOT NULL,
    reason TEXT NOT NULL, -- RECEIVE, EXPEDITION_RESERVE, EXPEDITION_CONSUME, DAMAGE, ADJUSTMENT
    related_expedition_id TEXT,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY(item_id) REFERENCES inventory_items(id)
);

CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- MEDICAL, WEATHER_HOLD, MECHANICAL_FAILURE, LOST_PERSONNEL, FIRE, CREVASSE_FALL
    severity TEXT NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL_MAYDAY
    location TEXT NOT NULL,
    status TEXT NOT NULL, -- OPEN, IN_PROGRESS, RESOLVED, ESCALATED
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    incident_commander_id TEXT,
    description TEXT NOT NULL,
    assigned_team_json TEXT
);

CREATE TABLE IF NOT EXISTS incident_log (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    action_note TEXT NOT NULL,
    FOREIGN KEY(incident_id) REFERENCES incidents(id)
);

CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    payload_json TEXT NOT NULL,
    synced_boolean INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    retry_count INTEGER DEFAULT 0
);
