// Antarctica Expedition & Logistics Platform (AELP) - Sync & Backup Engine

window.loadSyncQueueData = async function() {
    try {
        const queue = await API.get('/sync/queue');
        const tbody = document.getElementById('syncQueueTable');

        if (!queue || queue.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:var(--success-green); text-align:center;">SYNC QUEUE IS EMPTY. ALL DELTAS SYNCED TO HQ.</td></tr>';
            return;
        }

        tbody.innerHTML = queue.map(q => `
            <tr>
                <td><b>${q.table_name}</b></td>
                <td><code style="color:var(--polar-blue-light);">${q.record_id}</code></td>
                <td><span class="badge badge-info">${q.operation}</span></td>
                <td style="font-family:var(--font-mono); font-size:0.8rem;">${q.created_at}</td>
                <td><span class="badge badge-warning">PENDING UPLINK</span></td>
            </tr>
        `).join('');
    } catch(e) {
        console.error('Error loading sync queue:', e);
    }
};

document.getElementById('btnToggleSatellite').addEventListener('click', async () => {
    const res = await API.post('/sync/toggle', {});
    alert(`Satellite Link Status: ${res.satelliteOnline ? 'ONLINE (Uplink Established)' : 'OFFLINE (Zero Connectivity)'}`);
    window.loadDashboardStats();
});

document.getElementById('btnTriggerSync').addEventListener('click', async () => {
    try {
        const res = await API.post('/sync/process', {});
        if (res.error) {
            alert('Warning: ' + res.error);
        } else {
            alert(`SYNC SUCCESSFUL: Pushed ${res.syncedCount} delta records to Central HQ Server.`);
            window.loadSyncQueueData();
            window.loadDashboardStats();
        }
    } catch(e) {
        alert('Sync failed.');
    }
});

document.getElementById('btnBackupNow').addEventListener('click', async () => {
    try {
        const res = await API.post('/backups', {});
        if (res.success) {
            document.getElementById('backupResult').textContent = `Rolling Snapshot Saved: backups/${res.backupFile} (${res.timestamp})`;
        }
    } catch(e) {
        alert('Backup failed.');
    }
});
