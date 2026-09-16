package com.aelp.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "inventory_items")
public class InventoryItem implements Serializable {

    @Id
    private String id;
    private String name;
    private String category;
    private Double quantity;

    @Column(name = "reserved_qty")
    private Double reservedQty = 0.0;

    private String unit;

    @Column(name = "expiry_date")
    private String expiryDate;

    @Column(name = "reorder_threshold")
    private Double reorderThreshold;

    private String location;
    private String barcode;

    public InventoryItem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public Double getReservedQty() { return reservedQty; }
    public void setReservedQty(Double reservedQty) { this.reservedQty = reservedQty; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public Double getReorderThreshold() { return reorderThreshold; }
    public void setReorderThreshold(Double reorderThreshold) { this.reorderThreshold = reorderThreshold; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
}
