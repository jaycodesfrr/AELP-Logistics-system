package com.aelp.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "cargo_items")
public class CargoItem implements Serializable {

    @Id
    private String id;

    @Column(name = "shipment_id")
    private String shipmentId;

    private String description;
    private String category;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "volume_m3")
    private Double volumeM3;

    @Column(unique = true, nullable = false)
    private String barcode;

    private String status;

    @Column(name = "handling_instructions")
    private String handlingInstructions;

    @Column(name = "chain_of_custody_json", columnDefinition = "TEXT")
    private String chainOfCustodyJson;

    @Column(name = "damage_reported")
    private Integer damageReported = 0;

    @Column(name = "damage_notes")
    private String damageNotes;

    public CargoItem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getShipmentId() { return shipmentId; }
    public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Double getVolumeM3() { return volumeM3; }
    public void setVolumeM3(Double volumeM3) { this.volumeM3 = volumeM3; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getHandlingInstructions() { return handlingInstructions; }
    public void setHandlingInstructions(String handlingInstructions) { this.handlingInstructions = handlingInstructions; }

    public String getChainOfCustodyJson() { return chainOfCustodyJson; }
    public void setChainOfCustodyJson(String chainOfCustodyJson) { this.chainOfCustodyJson = chainOfCustodyJson; }

    public Integer getDamageReported() { return damageReported; }
    public void setDamageReported(Integer damageReported) { this.damageReported = damageReported; }

    public String getDamageNotes() { return damageNotes; }
    public void setDamageNotes(String damageNotes) { this.damageNotes = damageNotes; }
}
