// Antarctica Expedition & Logistics Platform (AELP) - Offline Map & Gantt Engine

window.drawAntarcticMap = function() {
    const canvas = document.getElementById('antarcticMap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas to container
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const w = canvas.width;
    const h = canvas.height;

    // Background - Deep Dark Polar Sea & Ice Sheet
    ctx.fillStyle = '#040912';
    ctx.fillRect(0, 0, w, h);

    // Polar Grid lines
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = 0; y < h; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Ross Ice Shelf Vector Simulation
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.2);
    ctx.quadraticCurveTo(w * 0.4, h * 0.1, w * 0.8, h * 0.3);
    ctx.quadraticCurveTo(w * 0.9, h * 0.7, w * 0.5, h * 0.9);
    ctx.quadraticCurveTo(w * 0.2, h * 0.8, w * 0.1, h * 0.2);
    ctx.fillStyle = '#0b1320';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Map Location Coords
    const locations = {
        mcmurdo: { name: "McMurdo Station (Main Base)", x: w * 0.25, y: h * 0.35, type: "BASE" },
        dryValleys: { name: "Dry Valleys Camp", x: w * 0.20, y: h * 0.25, type: "CAMP" },
        minnaBluff: { name: "Minna Bluff Fuel Depot (Km 350)", x: w * 0.35, y: h * 0.45, type: "DEPOT" },
        leverett: { name: "Leverett Glacier Ramp (CREVASSE ZONE)", x: w * 0.65, y: h * 0.70, type: "HAZARD" },
        southPole: { name: "Amundsen-Scott South Pole (90°S)", x: w * 0.82, y: h * 0.85, type: "POLE" }
    };

    // Draw Traverse Route Line (Rt-01: South Pole Highway)
    ctx.beginPath();
    ctx.moveTo(locations.mcmurdo.x, locations.mcmurdo.y);
    ctx.lineTo(locations.minnaBluff.x, locations.minnaBluff.y);
    ctx.lineTo(locations.leverett.x, locations.leverett.y);
    ctx.lineTo(locations.southPole.x, locations.southPole.y);
    ctx.strokeStyle = '#0284c7';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Dry Valleys Route (Rt-02)
    ctx.beginPath();
    ctx.moveTo(locations.mcmurdo.x, locations.mcmurdo.y);
    ctx.lineTo(locations.dryValleys.x, locations.dryValleys.y);
    ctx.strokeStyle = '#d97706';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Render Location Markers & Text
    Object.values(locations).forEach(loc => {
        ctx.beginPath();
        if (loc.type === "BASE") {
            ctx.arc(loc.x, loc.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#0284c7';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (loc.type === "HAZARD") {
            ctx.arc(loc.x, loc.y, 9, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(220, 38, 38, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        } else {
            ctx.arc(loc.x, loc.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#d97706';
            ctx.fill();
        }

        // Clean typography label
        ctx.fillStyle = loc.type === "HAZARD" ? '#dc2626' : '#f8fafc';
        ctx.font = '11px "JetBrains Mono", Consolas, monospace';
        ctx.fillText(loc.name, loc.x + 12, loc.y + 4);
    });

    // Active Field Team Marker (Capt. Miller at Minna Bluff)
    ctx.beginPath();
    ctx.arc(locations.minnaBluff.x, locations.minnaBluff.y, 11, 0, Math.PI * 2);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('TEAM ALPHA (CAPT. MILLER)', locations.minnaBluff.x - 60, locations.minnaBluff.y - 16);

    // Scale Bar & Compass
    ctx.fillStyle = '#64748b';
    ctx.fillRect(20, h - 30, 100, 3);
    ctx.font = '10px monospace';
    ctx.fillText('0', 20, h - 35);
    ctx.fillText('200 KM', 95, h - 35);
    ctx.fillText('N ▲', w - 40, 30);
};

window.loadGanttTimeline = async function() {
    const container = document.getElementById('ganttContainer');
    if (!container) return;

    try {
        const expeditions = await API.get('/expeditions');
        if (!expeditions || expeditions.length === 0) {
            container.innerHTML = '<p>No expeditions scheduled.</p>';
            return;
        }

        let html = '<div style="font-family:var(--font-mono); font-size:0.85rem;">';
        expeditions.forEach(exp => {
            html += `
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span><b>${exp.name}</b> (${exp.status})</span>
                        <span style="color:var(--polar-blue-light);">${exp.start_date} &rarr; ${exp.end_date}</span>
                    </div>
                    <div style="background:#0f172a; height:24px; border-radius:4px; overflow:hidden; border:1px solid var(--border-color); position:relative;">
                        <div style="background:#0284c7; width:75%; height:100%; display:flex; align-items:center; padding-left:8px; color:#ffffff; font-weight:bold; font-size:0.75rem;">
                            ACTIVE TRAVERSE &bull; ${exp.calculated_fuel_liters || 0} L FUEL RESERVED
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch(e) {
        console.error('Error loading Gantt timeline:', e);
    }
};

document.getElementById('expeditionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('expName').value,
        start_date: document.getElementById('expStart').value,
        end_date: document.getElementById('expEnd').value,
        route_id: document.getElementById('expRoute').value,
        team_lead_id: document.getElementById('expLead').value,
        team_size: parseInt(document.getElementById('expTeamSize').value),
        duration_days: parseInt(document.getElementById('expDays').value),
        distance_km: document.getElementById('expRoute').value === 'rt-01' ? 1600 : 185,
        objectives: document.getElementById('expObjectives').value,
        required_permits: 'NSF Polar Environmental Permit #2026-A'
    };

    const res = await API.post('/expeditions', data);
    alert(`Expedition '${res.name}' created.\nCalculated Fuel Needs: ${res.calculated_fuel_liters} Liters\nCalculated Rations: ${res.calculated_rations_kcal} kcal`);
    document.getElementById('expeditionForm').reset();
    window.loadGanttTimeline();
});
