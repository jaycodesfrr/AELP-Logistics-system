package com.aelp.controller;

import com.aelp.model.CargoItem;
import com.aelp.model.CargoShipment;
import com.aelp.model.InventoryItem;
import com.aelp.repository.CargoItemRepository;
import com.aelp.repository.CargoShipmentRepository;
import com.aelp.repository.InventoryItemRepository;
import com.aelp.service.SyncService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/cargo")
public class CargoController {

    @Autowired
    private CargoItemRepository cargoItemRepository;

    @Autowired
    private CargoShipmentRepository cargoShipmentRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private SyncService syncService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public List<Map<String, Object>> getAllCargo() {
        List<CargoItem> items = cargoItemRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (CargoItem item : items) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("shipment_id", item.getShipmentId());
            map.put("description", item.getDescription());
            map.put("category", item.getCategory());
            map.put("weight_kg", item.getWeightKg());
            map.put("volume_m3", item.getVolumeM3());
            map.put("barcode", item.getBarcode());
            map.put("status", item.getStatus());
            map.put("handling_instructions", item.getHandlingInstructions());
            map.put("chain_of_custody_json", item.getChainOfCustodyJson());

            if (item.getShipmentId() != null && !item.getShipmentId().isEmpty()) {
                try {
                    cargoShipmentRepository.findById(item.getShipmentId()).ifPresent(s -> {
                        map.put("manifest_ref", s.getManifestRef());
                        map.put("origin", s.getOrigin());
                        map.put("destination", s.getDestination());
                        map.put("transport_mode", s.getTransportMode());
                        map.put("priority", s.getPriority());
                    });
                } catch (Exception ignored) {}
            }

            result.add(map);
        }

        return result;
    }

    @PostMapping("/scan")
    public ResponseEntity<?> scanCargo(@RequestBody Map<String, Object> payload) {
        try {
            String barcode = (String) payload.get("barcode");
            String location = (String) payload.getOrDefault("location", "Checkpoint");
            String actor = (String) payload.getOrDefault("actor", "Logistics Officer");
            String newStatus = (String) payload.getOrDefault("newStatus", "STAGED_AT_STATION");

            Optional<CargoItem> opt = cargoItemRepository.findByBarcode(barcode);
            if (opt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Cargo item barcode not found: " + barcode));
            }

            CargoItem item = opt.get();
            List<Map<String, Object>> custody = new ArrayList<>();
            if (item.getChainOfCustodyJson() != null && !item.getChainOfCustodyJson().isEmpty()) {
                try {
                    custody = objectMapper.readValue(item.getChainOfCustodyJson(), new TypeReference<>() {});
                } catch (Exception ignored) {}
            }

            Map<String, Object> event = new HashMap<>();
            event.put("event", "Scanned at " + location + " (" + newStatus + ")");
            event.put("actor", actor);
            event.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            custody.add(event);

            String updatedCustodyJson = objectMapper.writeValueAsString(custody);
            item.setStatus(newStatus);
            item.setChainOfCustodyJson(updatedCustodyJson);
            cargoItemRepository.save(item);

            if ("STAGED_AT_STATION".equals(newStatus)) {
                if (inventoryItemRepository.findByBarcode(barcode).isEmpty()) {
                    String invId = "inv-auto-" + System.currentTimeMillis();
                    InventoryItem inv = new InventoryItem();
                    inv.setId(invId);
                    inv.setName(item.getDescription());
                    inv.setCategory(item.getCategory());
                    inv.setQuantity(10.0);
                    inv.setReservedQty(0.0);
                    inv.setUnit("Units");
                    inv.setExpiryDate("2027-12-31");
                    inv.setReorderThreshold(5.0);
                    inv.setLocation("Main Station Store");
                    inv.setBarcode(barcode);
                    inventoryItemRepository.save(inv);
                }
            }

            syncService.queueSyncDelta("cargo_items", item.getId(), "UPDATE", Map.of("id", item.getId(), "status", newStatus, "chain_of_custody_json", updatedCustodyJson));

            Map<String, Object> responseItem = new HashMap<>();
            responseItem.put("id", item.getId());
            responseItem.put("barcode", item.getBarcode());
            responseItem.put("description", item.getDescription());
            responseItem.put("category", item.getCategory());
            responseItem.put("status", newStatus);
            responseItem.put("chain_of_custody_json", updatedCustodyJson);

            return ResponseEntity.ok(Map.of("success", true, "item", responseItem));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCargo(@RequestBody Map<String, Object> payload) {
        try {
            String description = (String) payload.get("description");
            String category = (String) payload.get("category");
            String shipmentId = (String) payload.getOrDefault("shipment_id", "shp-2026-01");
            String handlingInstructions = (String) payload.get("handling_instructions");

            double weightKg = payload.get("weight_kg") != null ? Double.parseDouble(payload.get("weight_kg").toString()) : 10.0;
            double volumeM3 = payload.get("volume_m3") != null ? Double.parseDouble(payload.get("volume_m3").toString()) : 0.5;

            String id = "item-" + System.currentTimeMillis();
            String catCode = category != null && category.length() >= 3 ? category.substring(0, 3).toUpperCase() : "GEN";
            String barcode = "CRG-" + catCode + "-" + (1000 + new Random().nextInt(9000));

            List<Map<String, Object>> custody = List.of(Map.of(
                    "event", "Created & Tagged with QR",
                    "actor", "Logistics Officer",
                    "timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
            ));

            String custodyJson = objectMapper.writeValueAsString(custody);

            CargoItem item = new CargoItem();
            item.setId(id);
            item.setShipmentId(shipmentId);
            item.setDescription(description);
            item.setCategory(category);
            item.setWeightKg(weightKg);
            item.setVolumeM3(volumeM3);
            item.setBarcode(barcode);
            item.setStatus("PACKED");
            item.setHandlingInstructions(handlingInstructions);
            item.setChainOfCustodyJson(custodyJson);

            cargoItemRepository.save(item);

            syncService.queueSyncDelta("cargo_items", id, "INSERT", item);

            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
