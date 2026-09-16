// Antarctica Expedition & Logistics Platform (AELP) - Cargo & QR Engine

window.loadCargoData = async function() {
    try {
        const cargoItems = await API.get('/cargo');
        const tbody = document.getElementById('cargoTable');
        tbody.innerHTML = (cargoItems || []).map(item => `
            <tr>
                <td><b style="color:var(--polar-blue-light); font-family:var(--font-mono);">${item.barcode}</b></td>
                <td>${item.description}</td>
                <td><span class="badge badge-info">${item.category}</span></td>
                <td>${item.weight_kg} kg</td>
                <td><span class="badge ${item.status === 'STAGED_AT_STATION' ? 'badge-success' : 'badge-warning'}">${item.status}</span></td>
                <td>
                    <button class="btn btn-primary" onclick="generateQR('${item.barcode}', '${item.description}')" style="padding:4px 10px; font-size:0.75rem;">Generate QR</button>
                </td>
            </tr>
        `).join('');
    } catch(e) {
        console.error('Error loading cargo data:', e);
    }
};

window.generateQR = function(code, title) {
    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, w);

    // Draw procedural QR pattern
    ctx.fillStyle = '#000000';
    // Top-left finder pattern
    ctx.fillRect(10, 10, 35, 35);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(17, 17, 21, 21);
    ctx.fillStyle = '#000000';
    ctx.fillRect(24, 24, 7, 7);

    // Top-right finder pattern
    ctx.fillRect(w - 45, 10, 35, 35);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w - 38, 17, 21, 21);
    ctx.fillStyle = '#000000';
    ctx.fillRect(w - 31, 24, 7, 7);

    // Bottom-left finder pattern
    ctx.fillRect(10, w - 45, 35, 35);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(17, w - 38, 21, 21);
    ctx.fillStyle = '#000000';
    ctx.fillRect(24, w - 31, 7, 7);

    // Draw deterministic matrix dots based on code string
    for (let x = 10; x < w - 10; x += 10) {
        for (let y = 10; y < w - 10; y += 10) {
            if ((x < 50 && y < 50) || (x > w - 50 && y < 50) || (x < 50 && y > w - 50)) continue;
            if ((x + y + code.length) % 3 === 0) {
                ctx.fillRect(x, y, 7, 7);
            }
        }
    }

    document.getElementById('qrLabel').textContent = `${code} (${title})`;
};

document.getElementById('btnSimulateScan').addEventListener('click', async () => {
    const barcode = document.getElementById('scanInput').value.trim();
    const location = document.getElementById('scanLocation').value.trim() || 'Hangar 1';

    if (!barcode) return alert('Please enter or scan a barcode!');

    try {
        const res = await API.post('/cargo/scan', {
            barcode,
            location,
            actor: 'Logistics Officer Lars',
            newStatus: 'STAGED_AT_STATION'
        });

        if (res.success) {
            const container = document.getElementById('qrScanResult');
            container.style.display = 'block';

            let custodyHtml = '<ul>';
            try {
                const custody = JSON.parse(res.item.chain_of_custody_json || '[]');
                custody.forEach(c => {
                    custodyHtml += `<li><b>${c.timestamp}</b> - ${c.event} (by ${c.actor})</li>`;
                });
            } catch(e){}
            custodyHtml += '</ul>';

            container.innerHTML = `
                <p style="color:var(--success-green); font-weight:bold;">CARGO ITEM SCANNED &amp; UPDATED</p>
                <p><b>Description:</b> ${res.item.description}</p>
                <p><b>Status:</b> ${res.item.status}</p>
                <p><b>Chain of Custody:</b></p>
                ${custodyHtml}
            `;
            window.loadCargoData();
        }
    } catch(e) {
        alert('Barcode scan failed. Check if code exists.');
    }
});

document.getElementById('btnNewCargo').addEventListener('click', async () => {
    const desc = prompt('Enter Cargo Description (e.g., Satellite Transceiver Spare):');
    if (!desc) return;

    const category = prompt('Enter Category (FOOD / FUEL / MEDICAL / SCIENTIFIC):', 'SCIENTIFIC');
    const weight = parseFloat(prompt('Enter Weight in KG:', '45'));

    await API.post('/cargo', {
        description: desc,
        category: category || 'SCIENTIFIC',
        weight_kg: weight || 10,
        volume_m3: 0.2,
        handling_instructions: 'Handle with care in cold environment'
    });

    window.loadCargoData();
});
