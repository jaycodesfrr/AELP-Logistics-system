package com.aelp.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction implements Serializable {

    @Id
    private String id;

    @Column(name = "item_id")
    private String itemId;

    @Column(name = "change_qty")
    private Double changeQty;

    private String reason;

    @Column(name = "related_expedition_id")
    private String relatedExpeditionId;

    private String timestamp;

    @Column(name = "user_id")
    private String userId;

    public InventoryTransaction() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public Double getChangeQty() { return changeQty; }
    public void setChangeQty(Double changeQty) { this.changeQty = changeQty; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRelatedExpeditionId() { return relatedExpeditionId; }
    public void setRelatedExpeditionId(String relatedExpeditionId) { this.relatedExpeditionId = relatedExpeditionId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
