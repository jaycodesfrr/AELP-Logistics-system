package com.aelp.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "personnel_movement_log")
public class PersonnelMovementLog implements Serializable {

    @Id
    private String id;

    @Column(name = "personnel_id")
    private String personnelId;

    @Column(name = "event_type")
    private String eventType;

    private String location;
    private String timestamp;

    @Column(name = "expected_return")
    private String expectedReturn;

    @Column(name = "expedition_id")
    private String expeditionId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public PersonnelMovementLog() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPersonnelId() { return personnelId; }
    public void setPersonnelId(String personnelId) { this.personnelId = personnelId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getExpectedReturn() { return expectedReturn; }
    public void setExpectedReturn(String expectedReturn) { this.expectedReturn = expectedReturn; }

    public String getExpeditionId() { return expeditionId; }
    public void setExpeditionId(String expeditionId) { this.expeditionId = expeditionId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
