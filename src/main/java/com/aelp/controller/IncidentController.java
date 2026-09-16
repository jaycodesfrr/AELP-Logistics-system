package com.aelp.controller;

import com.aelp.model.Incident;
import com.aelp.model.IncidentLog;
import com.aelp.model.Personnel;
import com.aelp.repository.IncidentLogRepository;
import com.aelp.repository.IncidentRepository;
import com.aelp.repository.PersonnelRepository;
import com.aelp.service.SyncService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private IncidentLogRepository incidentLogRepository;

    @Autowired
    private PersonnelRepository personnelRepository;

    @Autowired
    private SyncService syncService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public ResponseEntity<?> createIncident(@RequestBody Map<String, Object> payload) {
        try {
            String type = (String) payload.get("type");
            String severity = (String) payload.get("severity");
            String location = (String) payload.get("location");
            String description = (String) payload.get("description");

            String skillQuery = "Medical";
            if ("CREVASSE_FALL".equals(type) || "LOST_PERSONNEL".equals(type)) {
                skillQuery = "Crevasse";
            } else if ("MECHANICAL_FAILURE".equals(type)) {
                skillQuery = "Snowcat";
            }

            List<Personnel> skilledTeam = personnelRepository.findByCertificationsJsonContainingIgnoreCase(skillQuery);
            List<String> assignedIds = skilledTeam.stream().map(Personnel::getId).toList();
            String assignedJson = objectMapper.writeValueAsString(assignedIds);

            String id = "inc-" + System.currentTimeMillis();
            String createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            Incident incident = new Incident();
            incident.setId(id);
            incident.setType(type);
            incident.setSeverity(severity);
            incident.setLocation(location);
            incident.setStatus("OPEN");
            incident.setCreatedAt(createdAt);
            incident.setIncidentCommanderId("usr-01");
            incident.setDescription(description);
            incident.setAssignedTeamJson(assignedJson);
            incidentRepository.save(incident);

            String logId = "inc-log-" + System.currentTimeMillis();
            IncidentLog log = new IncidentLog();
            log.setId(logId);
            log.setIncidentId(id);
            log.setTimestamp(createdAt);
            log.setActorId("usr-01");
            log.setActionNote("INCIDENT CREATED: " + type + " at " + location + ". Auto-matched " + assignedIds.size() + " qualified personnel.");
            incidentLogRepository.save(log);

            syncService.queueSyncDelta("incidents", id, "INSERT", incident);

            return ResponseEntity.ok(Map.of(
                    "id", id,
                    "type", type,
                    "severity", severity,
                    "location", location,
                    "status", "OPEN",
                    "created_at", createdAt,
                    "description", description,
                    "assigned_team", skilledTeam
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveIncident(@PathVariable("id") String id) {
        Optional<Incident> opt = incidentRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Incident not found"));
        }

        String resolvedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        Incident incident = opt.get();
        incident.setStatus("RESOLVED");
        incident.setResolvedAt(resolvedAt);
        incidentRepository.save(incident);

        syncService.queueSyncDelta("incidents", id, "UPDATE", Map.of("id", id, "status", "RESOLVED", "resolved_at", resolvedAt));

        return ResponseEntity.ok(Map.of("success", true, "id", id, "status", "RESOLVED"));
    }
}
