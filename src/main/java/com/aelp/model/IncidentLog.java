package com.aelp.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "incident_log")
public class IncidentLog implements Serializable {

    @Id
    private String id;

    @Column(name = "incident_id")
    private String incidentId;

    private String timestamp;

    @Column(name = "actor_id")
    private String actorId;

    @Column(name = "action_note")
    private String actionNote;

    public IncidentLog() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }

    public String getActionNote() { return actionNote; }
    public void setActionNote(String actionNote) { this.actionNote = actionNote; }
}
