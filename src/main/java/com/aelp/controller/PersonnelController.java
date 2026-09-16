package com.aelp.controller;

import com.aelp.model.Personnel;
import com.aelp.model.PersonnelMovementLog;
import com.aelp.repository.PersonnelMovementLogRepository;
import com.aelp.repository.PersonnelRepository;
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
@RequestMapping("/api/personnel")
public class PersonnelController {

    @Autowired
    private PersonnelRepository personnelRepository;

    @Autowired
    private PersonnelMovementLogRepository movementLogRepository;

    @Autowired
    private SyncService syncService;

    @GetMapping
    public List<Personnel> getAllPersonnel() {
        return personnelRepository.findAll();
    }

    @PostMapping("/movement")
    public ResponseEntity<?> logMovement(@RequestBody Map<String, Object> payload) {
        try {
            String personnelId = (String) payload.get("personnel_id");
            String eventType = (String) payload.get("event_type");
            String location = (String) payload.get("location");
            String expectedReturn = (String) payload.get("expected_return");
            String notes = (String) payload.getOrDefault("notes", "");

            Optional<Personnel> opt = personnelRepository.findById(personnelId);
            if (opt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Personnel not found"));
            }

            Personnel p = opt.get();
            String providedPassword = (String) payload.get("password");
            if (providedPassword == null || p.getPassword() == null || !p.getPassword().trim().equals(providedPassword.trim())) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication Failed: Incorrect personal security password for " + p.getName()));
            }
            String newStatus = "AT_STATION";
            if ("CHECK_OUT".equals(eventType)) {
                newStatus = "IN_FIELD";
            } else if ("CHECK_IN".equals(eventType)) {
                newStatus = "AT_STATION";
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            p.setCurrentStatus(newStatus);
            p.setCurrentLocation(location);
            p.setLastCheckin(timestamp);
            personnelRepository.save(p);

            String logId = "pml-" + System.currentTimeMillis();
            PersonnelMovementLog log = new PersonnelMovementLog();
            log.setId(logId);
            log.setPersonnelId(personnelId);
            log.setEventType(eventType);
            log.setLocation(location);
            log.setTimestamp(timestamp);
            log.setExpectedReturn(expectedReturn);
            log.setNotes(notes);
            movementLogRepository.save(log);

            syncService.queueSyncDelta("personnel", personnelId, "UPDATE", Map.of("id", personnelId, "current_status", newStatus, "current_location", location));

            return ResponseEntity.ok(Map.of("success", true, "personnel_id", personnelId, "newStatus", newStatus, "location", location, "timestamp", timestamp));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
