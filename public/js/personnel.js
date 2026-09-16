// Antarctica Expedition & Logistics Platform (AELP) - Personnel Engine

window.loadPersonnelData = async function() {
    try {
        const personnel = await API.get('/personnel');
        const tbody = document.getElementById('personnelTable');
        const select = document.getElementById('movePersonnelId');

        const currentSelectedId = select.value;

        select.innerHTML = '';
        tbody.innerHTML = (personnel || []).map(p => {
            const status = p.current_status || p.currentStatus || 'AT_STATION';
            const location = p.current_location || p.currentLocation || 'McMurdo Station';
            const lastCheckin = p.last_checkin || p.lastCheckin || 'N/A';
            const isInField = status === 'IN_FIELD';

            const optionSelected = p.id === currentSelectedId ? 'selected' : '';
            select.innerHTML += `<option value="${p.id}" ${optionSelected}>${p.name} — [${status}] (${p.role})</option>`;

            return `
                <tr>
                    <td>
                        <b>${p.name}</b>
                        <br><small style="color:var(--text-muted);">${p.id}</small>
                    </td>
                    <td>${p.role}</td>
                    <td>
                        <span class="badge ${isInField ? 'badge-warning' : 'badge-success'}">${status}</span>
                    </td>
                    <td><b>${location}</b></td>
                    <td style="font-family:var(--font-mono); font-size:0.8rem;">${lastCheckin}</td>
                </tr>
            `;
        }).join('');
    } catch(e) {
        console.error('Error loading personnel data:', e);
    }
};

document.getElementById('movementForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        personnel_id: document.getElementById('movePersonnelId').value,
        event_type: document.getElementById('moveType').value,
        location: document.getElementById('moveLocation').value,
        password: document.getElementById('movePassword').value,
        expected_return: document.getElementById('moveReturn').value,
        notes: 'Field excursion movement record'
    };

    try {
        const res = await API.post('/personnel/movement', data);
        if (res.error) {
            alert(`[AUTHENTICATION ERROR] ${res.error}`);
            return;
        }
        alert(`Personnel movement logged successfully!\nStatus updated to: ${res.newStatus}\nLocation: ${res.location}`);
        document.getElementById('movePassword').value = '';
        document.getElementById('moveLocation').value = '';
        await window.loadPersonnelData();
        if (window.loadDashboardStats) {
            window.loadDashboardStats();
        }
    } catch(err) {
        alert('[AUTHENTICATION ERROR] Incorrect security password or server error.');
    }
});
