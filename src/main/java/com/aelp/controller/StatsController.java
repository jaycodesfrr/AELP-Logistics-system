package com.aelp.controller;

import com.aelp.repository.*;
import com.aelp.service.SyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StatsController {

    @Autowired
    private PersonnelRepository personnelRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private ExpeditionRepository expeditionRepository;

    @Autowired
    private SyncQueueRepository syncQueueRepository;

    @Autowired
    private SyncService syncService;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("activeFieldPersonnel", personnelRepository.countByCurrentStatus("IN_FIELD"));
        stats.put("lowStockItems", inventoryItemRepository.countLowStockItems());
        stats.put("openIncidents", incidentRepository.countByStatusNot("RESOLVED"));
        stats.put("activeExpeditions", expeditionRepository.countByStatusIn(List.of("APPROVED", "ACTIVE")));
        stats.put("pendingSyncCount", syncQueueRepository.countBySyncedBoolean(0));
        stats.put("satelliteOnline", syncService.isSatelliteOnline());

        return stats;
    }
}
