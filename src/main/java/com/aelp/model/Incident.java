package com.aelp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "incidents")
public class Incident implements Serializable {

    @Id
    private String id;
    private String type;
    private String severity;
    private String location;
    private String status;

    @JsonProperty("created_at")
    @Column(name = "created_at")
    private String createdAt;

    @JsonProperty("resolved_at")
    @Column(name = "resolved_at")
    private String resolvedAt;

    @JsonProperty("incident_commander_id")
    @Column(name = "incident_commander_id")
    private String incidentCommanderId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JsonProperty("assigned_team_json")
    @Column(name = "assigned_team_json", columnDefinition = "TEXT")
    private String assignedTeamJson;

    public Incident() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getIncidentCommanderId() { return incidentCommanderId; }
    public void setIncidentCommanderId(String incidentCommanderId) { this.incidentCommanderId = incidentCommanderId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAssignedTeamJson() { return assignedTeamJson; }
    public void setAssignedTeamJson(String assignedTeamJson) { this.assignedTeamJson = assignedTeamJson; }
}
