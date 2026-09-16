package com.aelp.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "routes")
public class Route implements Serializable {

    @Id
    private String id;
    private String name;

    @Column(name = "waypoints_json", columnDefinition = "TEXT")
    private String waypointsJson;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "hazard_notes")
    private String hazardNotes;

    public Route() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getWaypointsJson() { return waypointsJson; }
    public void setWaypointsJson(String waypointsJson) { this.waypointsJson = waypointsJson; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getHazardNotes() { return hazardNotes; }
    public void setHazardNotes(String hazardNotes) { this.hazardNotes = hazardNotes; }
}
