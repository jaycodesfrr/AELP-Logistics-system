package com.aelp.controller;

import com.aelp.model.Expedition;
import com.aelp.model.Personnel;
import com.aelp.model.Route;
import com.aelp.repository.ExpeditionRepository;
import com.aelp.repository.PersonnelRepository;
import com.aelp.repository.RouteRepository;
import com.aelp.service.SyncService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/expeditions")
public class ExpeditionController {

    @Autowired
    private ExpeditionRepository expeditionRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private PersonnelRepository personnelRepository;

    @Autowired
    private SyncService syncService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public List<Map<String, Object>> getAllExpeditions() {
        List<Expedition> expeditions = expeditionRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Expedition e : expeditions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("name", e.getName());
            map.put("start_date", e.getStartDate());
            map.put("end_date", e.getEndDate());
            map.put("status", e.getStatus());
            map.put("route_id", e.getRouteId());
            map.put("team_lead_id", e.getTeamLeadId());
            map.put("objectives", e.getObjectives());
            map.put("risk_assessment_json", e.getRiskAssessmentJson());
            map.put("required_permits", e.getRequiredPermits());
            map.put("calculated_fuel_liters", e.getCalculatedFuelLiters());
            map.put("calculated_rations_kcal", e.getCalculatedRationsKcal());

            if (e.getRouteId() != null) {
                routeRepository.findById(e.getRouteId()).ifPresent(r -> {
                    map.put("route_name", r.getName());
                    map.put("distance_km", r.getDistanceKm());
                    map.put("waypoints_json", r.getWaypointsJson());
                });
            }

            if (e.getTeamLeadId() != null) {
                personnelRepository.findById(e.getTeamLeadId()).ifPresent(p -> {
                    map.put("team_lead_name", p.getName());
                });
            }

            result.add(map);
        }

        return result;
    }

    @PostMapping
    public ResponseEntity<?> createExpedition(@RequestBody Map<String, Object> payload) {
        try {
            String name = (String) payload.get("name");
            String startDate = (String) payload.get("start_date");
            String endDate = (String) payload.get("end_date");
            String routeId = (String) payload.get("route_id");
            String teamLeadId = (String) payload.get("team_lead_id");
            String objectives = (String) payload.get("objectives");
            String requiredPermits = (String) payload.get("required_permits");

            double distanceKm = payload.get("distance_km") != null ? Double.parseDouble(payload.get("distance_km").toString()) : 0.0;
            double teamSize = payload.get("team_size") != null ? Double.parseDouble(payload.get("team_size").toString()) : 4.0;
            double durationDays = payload.get("duration_days") != null ? Double.parseDouble(payload.get("duration_days").toString()) : 10.0;

            String id = "exp-" + System.currentTimeMillis();
            double calculatedFuel = Math.round(distanceKm * 1.6 * 1.25);
            double calculatedRations = Math.round(teamSize * durationDays * 4000.0);

            Map<String, Object> riskMap = new HashMap<>();
            riskMap.put("weatherWindow", "CHECK_PENDING");
            riskMap.put("crevasseRisk", distanceKm > 500 ? "HIGH" : "MODERATE");
            riskMap.put("fuelMarginPct", 25);
            riskMap.put("radioCheckIntervalMinutes", 120);

            String riskJson = objectMapper.writeValueAsString(riskMap);

            Expedition expedition = new Expedition();
            expedition.setId(id);
            expedition.setName(name);
            expedition.setStartDate(startDate);
            expedition.setEndDate(endDate);
            expedition.setStatus("DRAFT");
            expedition.setRouteId(routeId);
            expedition.setTeamLeadId(teamLeadId);
            expedition.setObjectives(objectives);
            expedition.setRiskAssessmentJson(riskJson);
            expedition.setRequiredPermits(requiredPermits);
            expedition.setCalculatedFuelLiters(calculatedFuel);
            expedition.setCalculatedRationsKcal(calculatedRations);

            expeditionRepository.save(expedition);

            syncService.queueSyncDelta("expeditions", id, "INSERT", expedition);

            return ResponseEntity.ok(expedition);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") String id, @RequestBody Map<String, Object> body) {
        String status = (String) body.get("status");
        Optional<Expedition> opt = expeditionRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Expedition not found"));
        }

        Expedition expedition = opt.get();
        expedition.setStatus(status);
        expeditionRepository.save(expedition);

        syncService.queueSyncDelta("expeditions", id, "UPDATE", Map.of("id", id, "status", status));

        return ResponseEntity.ok(Map.of("success", true, "id", id, "status", status));
    }
}
