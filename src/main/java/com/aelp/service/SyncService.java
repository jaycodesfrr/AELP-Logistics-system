package com.aelp.service;

import com.aelp.model.SyncQueue;
import com.aelp.repository.SyncQueueRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class SyncService {

    @Autowired
    private SyncQueueRepository syncQueueRepository;

    private boolean satelliteOnline = false;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    public boolean isSatelliteOnline() {
        return satelliteOnline;
    }

    public boolean toggleSatelliteOnline() {
        this.satelliteOnline = !this.satelliteOnline;
        return this.satelliteOnline;
    }

    public void queueSyncDelta(String tableName, String recordId, String operation, Object payload) {
        try {
            SyncQueue queueItem = new SyncQueue();
            queueItem.setId("sync-" + System.currentTimeMillis() + "-" + random.nextInt(1000));
            queueItem.setTableName(tableName);
            queueItem.setRecordId(recordId);
            queueItem.setOperation(operation);
            queueItem.setPayloadJson(objectMapper.writeValueAsString(payload));
            queueItem.setSyncedBoolean(0);
            queueItem.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            queueItem.setRetryCount(0);
            syncQueueRepository.save(queueItem);
        } catch (Exception e) {
            System.err.println("Failed to queue sync delta: " + e.getMessage());
        }
    }

    public Map<String, Object> processSyncQueue() {
        Map<String, Object> response = new HashMap<>();
        if (!satelliteOnline) {
            response.put("error", "Satellite connection is currently OFFLINE. Cannot sync with HQ server.");
            return response;
        }

        List<SyncQueue> pendingItems = syncQueueRepository.findBySyncedBooleanOrderByCreatedAtAsc(0);
        if (pendingItems.isEmpty()) {
            response.put("syncedCount", 0);
            response.put("message", "Sync queue is clear.");
            return response;
        }

        for (SyncQueue item : pendingItems) {
            item.setSyncedBoolean(1);
        }
        syncQueueRepository.saveAll(pendingItems);

        response.put("syncedCount", pendingItems.size());
        response.put("syncedIds", pendingItems.stream().map(SyncQueue::getId).toList());
        return response;
    }

    public Map<String, Object> createLocalBackup() {
        Map<String, Object> response = new HashMap<>();
        try {
            File currentDb = new File("aelp_station.db");
            File backupDir = new File("backups");
            if (!backupDir.exists()) {
                backupDir.mkdirs();
            }

            String backupFileName = "aelp_backup_" + System.currentTimeMillis() + ".db";
            File destFile = new File(backupDir, backupFileName);

            Files.copy(currentDb.toPath(), destFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

            response.put("success", true);
            response.put("backupFile", backupFileName);
            response.put("timestamp", LocalDateTime.now().toString());
        } catch (Exception e) {
            response.put("error", "Backup failed: " + e.getMessage());
        }
        return response;
    }
}
