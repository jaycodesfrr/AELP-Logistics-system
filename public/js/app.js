// Antarctica Expedition & Logistics Platform (AELP) - Main App Coordinator

const API = {
    async get(endpoint) {
        const res = await fetch(`/api${endpoint}`);
        return res.json();
    },
    async post(endpoint, data) {
        const res = await fetch(`/api${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    async put(endpoint, data) {
        const res = await fetch(`/api${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadDashboardStats();

    // Floating Emergency FAB
    document.getElementById('fabEmergency').addEventListener('click', () => {
        switchTab('emergency');
    });

    setInterval(loadDashboardStats, 10000);
});

function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            switchTab(target);
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });

    // Trigger tab-specific refresh
    if (tabId === 'expeditions' && window.drawAntarcticMap) {
        window.drawAntarcticMap();
        window.loadGanttTimeline();
    } else if (tabId === 'cargo' && window.loadCargoData) {
        window.loadCargoData();
    } else if (tabId === 'inventory' && window.loadInventoryData) {
        window.loadInventoryData();
    } else if (tabId === 'personnel' && window.loadPersonnelData) {
        window.loadPersonnelData();
    } else if (tabId === 'emergency' && window.loadIncidentsData) {
        window.loadIncidentsData();
    } else if (tabId === 'sync' && window.loadSyncQueueData) {
        window.loadSyncQueueData();
    }
}

async function loadDashboardStats() {
    try {
        const stats = await API.get('/stats');
        document.getElementById('statPersonnel').textContent = stats.activeFieldPersonnel || 0;
        document.getElementById('statExpeditions').textContent = stats.activeExpeditions || 0;
        document.getElementById('statLowStock').textContent = stats.lowStockItems || 0;
        document.getElementById('statIncidents').textContent = stats.openIncidents || 0;
        document.getElementById('pendingQueueBadge').textContent = `${stats.pendingSyncCount || 0} DELTAS`;

        const satDot = document.getElementById('satDot');
        const satText = document.getElementById('satText');
        if (stats.satelliteOnline) {
            satDot.className = 'status-dot online';
            satText.textContent = 'SATELLITE: ONLINE (UPLINK 1.2 Mbps)';
        } else {
            satDot.className = 'status-dot offline';
            satText.textContent = 'SATELLITE: OFFLINE (OFFGRID QUEUEING)';
        }

        // Load dashboard expeditions table
        const expeditions = await API.get('/expeditions');
        const tbody = document.getElementById('dashExpeditionTable');
        tbody.innerHTML = (expeditions || []).map(exp => `
            <tr>
                <td><b>${exp.name}</b></td>
                <td><span class="badge ${exp.status === 'APPROVED' || exp.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}">${exp.status}</span></td>
                <td>${exp.team_lead_name || exp.team_lead_id}</td>
                <td><b style="color:var(--polar-cyan);">${(exp.calculated_fuel_liters || 0).toLocaleString()} L</b></td>
                <td>${(exp.calculated_rations_kcal || 0).toLocaleString()} kcal</td>
            </tr>
        `).join('');
    } catch(e) {
        console.error('Error loading dashboard stats:', e);
    }
}
