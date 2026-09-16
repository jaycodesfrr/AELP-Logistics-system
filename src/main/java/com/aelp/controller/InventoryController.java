package com.aelp.controller;

import com.aelp.model.InventoryItem;
import com.aelp.model.InventoryTransaction;
import com.aelp.repository.InventoryItemRepository;
import com.aelp.repository.InventoryTransactionRepository;
import com.aelp.service.SyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private SyncService syncService;

    @GetMapping
    public List<InventoryItem> getAllInventory() {
        return inventoryItemRepository.findAll();
    }

    @PostMapping("/transaction")
    public ResponseEntity<?> createTransaction(@RequestBody Map<String, Object> payload) {
        try {
            String itemId = (String) payload.get("item_id");
            double changeQty = Double.parseDouble(payload.get("change_qty").toString());
            String reason = (String) payload.get("reason");
            String relatedExpeditionId = (String) payload.get("related_expedition_id");
            String userId = (String) payload.getOrDefault("user_id", "usr-02");

            Optional<InventoryItem> opt = inventoryItemRepository.findById(itemId);
            if (opt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Item not found"));
            }

            InventoryItem item = opt.get();
            double newQty = item.getQuantity() != null ? item.getQuantity() : 0.0;
            double newReserved = item.getReservedQty() != null ? item.getReservedQty() : 0.0;

            if ("EXPEDITION_RESERVE".equals(reason)) {
                newReserved += changeQty;
            } else {
                newQty += changeQty;
            }

            item.setQuantity(newQty);
            item.setReservedQty(newReserved);
            inventoryItemRepository.save(item);

            String txId = "tx-" + System.currentTimeMillis();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            InventoryTransaction tx = new InventoryTransaction();
            tx.setId(txId);
            tx.setItemId(itemId);
            tx.setChangeQty(changeQty);
            tx.setReason(reason);
            tx.setRelatedExpeditionId(relatedExpeditionId);
            tx.setTimestamp(timestamp);
            tx.setUserId(userId);
            inventoryTransactionRepository.save(tx);

            syncService.queueSyncDelta("inventory_items", itemId, "UPDATE", Map.of("id", itemId, "quantity", newQty, "reserved_qty", newReserved));

            return ResponseEntity.ok(Map.of("success", true, "item_id", itemId, "newQuantity", newQty, "newReservedQty", newReserved));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
