// Antarctica Expedition & Logistics Platform (AELP) - Emergency Response Engine

window.loadIncidentsData = async function() {
    try {
        const [incidents, personnelList] = await Promise.all([
            API.get('/incidents'),
            API.get('/personnel')
        ]);
        const personnelMap = {};
        (personnelList || []).forEach(p => {
            personnelMap[p.id] = `${p.name} (${p.role})`;
        });

        const container = document.getElementById('incidentsContainer');

        if (!incidents || incidents.length === 0) {
            container.innerHTML = '<p style="color:var(--success-green); font-weight:bold;">NO ACTIVE EMERGENCY INCIDENTS REPORTED.</p>';
            return;
        }

        container.innerHTML = incidents.map(inc => {
            const isOpen = inc.status !== 'RESOLVED';
            const rawTeam = inc.assigned_team_json || inc.assignedTeamJson || '[]';
            let teamIds = [];
            try {
                teamIds = typeof rawTeam === 'string' ? JSON.parse(rawTeam) : (rawTeam || []);
            } catch(e) {
                teamIds = [];
            }

            const teamNames = teamIds.map(id => personnelMap[id] || id);
            const resolvedAt = inc.resolved_at || inc.resolvedAt || 'N/A';

            return `
                <div style="background:#040912; border:1px solid ${isOpen ? 'var(--alert-red)' : 'var(--border-color)'}; border-radius:6px; padding:16px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <div>
                            <span class="badge badge-danger">${inc.severity}</span>
                            <b style="font-size:1.05rem; margin-left:8px; color:var(--text-primary);">${inc.type}</b>
                        </div>
                        <span class="badge ${isOpen ? 'badge-danger' : 'badge-success'}">${inc.status}</span>
                    </div>
                    <p style="font-size:0.92rem; margin-bottom:6px;"><b>Location:</b> ${inc.location}</p>
                    <p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:12px;">${inc.description}</p>
                    
                    <div style="background:#0f172a; padding:10px; border-radius:4px; margin-bottom:12px; border:1px solid var(--border-bright);">
                        <p style="font-size:0.75rem; color:var(--polar-blue-light); font-family:var(--font-mono); margin-bottom:4px; text-transform:uppercase;">AUTO-MATCHED EMERGENCY RESPONSE PERSONNEL (${teamNames.length}):</p>
                        <p style="font-size:0.85rem; color:var(--text-primary);">${teamNames.length > 0 ? teamNames.join(' • ') : 'Assembling Field Response Unit...'}</p>
                    </div>

                    ${isOpen ? `
                        <button class="btn btn-primary" onclick="resolveIncident('${inc.id}')" style="background:var(--success-green); color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:bold; cursor:pointer;">
                            Resolve Incident &amp; Clear Mayday
                        </button>
                    ` : `<p style="font-size:0.85rem; color:var(--success-green); font-weight:bold; margin-top:8px;">Resolved at: ${resolvedAt}</p>`}
                </div>
            `;
        }).join('');
    } catch(e) {
        console.error('Error loading incidents:', e);
    }
};

document.getElementById('emergencyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        type: document.getElementById('incType').value,
        severity: document.getElementById('incSeverity').value,
        location: document.getElementById('incLocation').value,
        description: document.getElementById('incDesc').value
    };

    const res = await API.post('/incidents', data);
    alert(`EMERGENCY MAYDAY BROADCASTED\nIncident ID: ${res.id}\nAuto-Matched Skilled Personnel Assigned.`);
    document.getElementById('emergencyForm').reset();
    window.loadIncidentsData();
    if (window.loadDashboardStats) window.loadDashboardStats();
});

window.resolveIncident = async function(id) {
    if (confirm('Are you sure you want to mark this emergency incident as RESOLVED?')) {
        await API.put(`/incidents/${id}/resolve`, {});
        window.loadIncidentsData();
        if (window.loadDashboardStats) window.loadDashboardStats();
    }
};
