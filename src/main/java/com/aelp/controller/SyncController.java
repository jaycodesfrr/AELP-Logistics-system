package com.aelp.controller;

import com.aelp.model.SyncQueue;
import com.aelp.repository.SyncQueueRepository;
import com.aelp.service.SyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SyncController {

    @Autowired
    private SyncQueueRepository syncQueueRepository;

    @Autowired
    private SyncService syncService;

    @GetMapping("/sync/queue")
    public List<SyncQueue> getUnsyncedQueue() {
        return syncQueueRepository.findBySyncedBooleanOrderByCreatedAtAsc(0);
    }

    @PostMapping("/sync/toggle")
    public Map<String, Object> toggleSatelliteLink() {
        boolean online = syncService.toggleSatelliteOnline();
        return Map.of("satelliteOnline", online);
    }

    @PostMapping("/sync/process")
    public Map<String, Object> processSyncQueue() {
        return syncService.processSyncQueue();
    }

    @PostMapping("/backups")
    public Map<String, Object> createBackup() {
        return syncService.createLocalBackup();
    }
}
