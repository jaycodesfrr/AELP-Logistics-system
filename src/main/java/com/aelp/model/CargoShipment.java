package com.aelp.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "cargo_shipments")
public class CargoShipment implements Serializable {

    @Id
    private String id;

    @Column(name = "manifest_ref")
    private String manifestRef;

    private String origin;
    private String destination;
    private String status;

    @Column(name = "transport_mode")
    private String transportMode;

    private String eta;
    private String priority;

    public CargoShipment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getManifestRef() { return manifestRef; }
    public void setManifestRef(String manifestRef) { this.manifestRef = manifestRef; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public String getEta() { return eta; }
    public void setEta(String eta) { this.eta = eta; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
