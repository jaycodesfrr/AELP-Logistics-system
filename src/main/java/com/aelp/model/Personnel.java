package com.aelp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "personnel")
public class Personnel implements Serializable {

    @Id
    private String id;
    private String name;
    private String role;

    @JsonProperty("certifications_json")
    @Column(name = "certifications_json", columnDefinition = "TEXT")
    private String certificationsJson;

    @JsonProperty("current_status")
    @Column(name = "current_status")
    private String currentStatus;

    @JsonProperty("current_location")
    @Column(name = "current_location")
    private String currentLocation;

    @JsonProperty("emergency_contact")
    @Column(name = "emergency_contact")
    private String emergencyContact;

    @JsonProperty("blood_type")
    @Column(name = "blood_type")
    private String bloodType;

    @JsonProperty("last_checkin")
    @Column(name = "last_checkin")
    private String lastCheckin;

    @Column(name = "password")
    private String password;

    public Personnel() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCertificationsJson() { return certificationsJson; }
    public void setCertificationsJson(String certificationsJson) { this.certificationsJson = certificationsJson; }

    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }

    public String getLastCheckin() { return lastCheckin; }
    public void setLastCheckin(String lastCheckin) { this.lastCheckin = lastCheckin; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
