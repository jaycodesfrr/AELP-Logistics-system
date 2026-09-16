package com.aelp.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "sync_queue")
public class SyncQueue implements Serializable {

    @Id
    private String id;

    @Column(name = "table_name")
    private String tableName;

    @Column(name = "record_id")
    private String recordId;

    private String operation;

    @Column(name = "payload_json", columnDefinition = "TEXT")
    private String payloadJson;

    @Column(name = "synced_boolean")
    private Integer syncedBoolean = 0;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "retry_count")
    private Integer retryCount = 0;

    public SyncQueue() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }

    public String getRecordId() { return recordId; }
    public void setRecordId(String recordId) { this.recordId = recordId; }

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }

    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }

    public Integer getSyncedBoolean() { return syncedBoolean; }
    public void setSyncedBoolean(Integer syncedBoolean) { this.syncedBoolean = syncedBoolean; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }
}
