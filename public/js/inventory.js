// Antarctica Expedition & Logistics Platform (AELP) - Inventory Engine

window.loadInventoryData = async function() {
    try {
        const items = await API.get('/inventory');
        const tbody = document.getElementById('inventoryTable');

        tbody.innerHTML = (items || []).map(item => {
            const reserved = item.reserved_qty ?? item.reservedQty ?? 0;
            const threshold = item.reorder_threshold ?? item.reorderThreshold ?? 0;
            const expiry = item.expiry_date ?? item.expiryDate ?? 'N/A';
            const avail = (item.quantity || 0) - reserved;
            const isLow = item.quantity <= threshold;
            const isNearExpiry = expiry && expiry.startsWith('2026');

            return `
                <tr style="${isLow ? 'background:rgba(255, 183, 0, 0.05);' : ''}">
                    <td><b style="font-family:var(--font-mono); color:var(--polar-cyan);">${item.barcode || 'N/A'}</b></td>
                    <td><b>${item.name}</b></td>
                    <td><span class="badge badge-info">${item.category}</span></td>
                    <td><b>${item.quantity}</b> ${item.unit}</td>
                    <td style="color:var(--warning-amber);">${reserved} ${item.unit}</td>
                    <td style="color:var(--success-emerald); font-weight:bold;">${avail} ${item.unit}</td>
                    <td style="${isNearExpiry ? 'color:var(--alert-crimson); font-weight:bold;' : ''}">${expiry}</td>
                    <td>${threshold} ${item.unit}</td>
                    <td>${item.location}</td>
                </tr>
            `;
        }).join('');
    } catch(e) {
        console.error('Error loading inventory data:', e);
    }
};

document.getElementById('btnReserveStock').addEventListener('click', async () => {
    const items = await API.get('/inventory');
    if (!items || items.length === 0) return alert('No inventory items available.');

    const itemId = prompt('Enter Item ID or Name to Reserve (e.g. inv-101 for Aviation Fuel):', 'inv-101');
    const qty = parseFloat(prompt('Enter Quantity to Reserve for Expedition:', '50'));

    if (itemId && qty > 0) {
        try {
            const res = await API.post('/inventory/transaction', {
                item_id: itemId,
                change_qty: qty,
                reason: 'EXPEDITION_RESERVE',
                related_expedition_id: 'exp-2026-01',
                user_id: 'usr-02'
            });

            if (res.success) {
                alert(`Successfully reserved ${qty} units for Expedition! New Available Qty updated.`);
                window.loadInventoryData();
            }
        } catch(e) {
            alert('Stock reservation failed. Check item ID.');
        }
    }
});
