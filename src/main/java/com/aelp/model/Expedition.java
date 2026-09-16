package com.aelp.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "expeditions")
public class Expedition implements Serializable {

    @Id
    private String id;
    private String name;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    private String status;

    @Column(name = "route_id")
    private String routeId;

    @Column(name = "team_lead_id")
    private String teamLeadId;

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @Column(name = "risk_assessment_json", columnDefinition = "TEXT")
    private String riskAssessmentJson;

    @Column(name = "required_permits")
    private String requiredPermits;

    @Column(name = "calculated_fuel_liters")
    private Double calculatedFuelLiters;

    @Column(name = "calculated_rations_kcal")
    private Double calculatedRationsKcal;

    public Expedition() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRouteId() { return routeId; }
    public void setRouteId(String routeId) { this.routeId = routeId; }

    public String getTeamLeadId() { return teamLeadId; }
    public void setTeamLeadId(String teamLeadId) { this.teamLeadId = teamLeadId; }

    public String getObjectives() { return objectives; }
    public void setObjectives(String objectives) { this.objectives = objectives; }

    public String getRiskAssessmentJson() { return riskAssessmentJson; }
    public void setRiskAssessmentJson(String riskAssessmentJson) { this.riskAssessmentJson = riskAssessmentJson; }

    public String getRequiredPermits() { return requiredPermits; }
    public void setRequiredPermits(String requiredPermits) { this.requiredPermits = requiredPermits; }

    public Double getCalculatedFuelLiters() { return calculatedFuelLiters; }
    public void setCalculatedFuelLiters(Double calculatedFuelLiters) { this.calculatedFuelLiters = calculatedFuelLiters; }

    public Double getCalculatedRationsKcal() { return calculatedRationsKcal; }
    public void setCalculatedRationsKcal(Double calculatedRationsKcal) { this.calculatedRationsKcal = calculatedRationsKcal; }
}
