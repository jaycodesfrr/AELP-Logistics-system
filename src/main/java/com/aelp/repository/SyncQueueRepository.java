package com.aelp.repository;

import com.aelp.model.SyncQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyncQueueRepository extends JpaRepository<SyncQueue, String> {
    long countBySyncedBoolean(Integer syncedBoolean);
    List<SyncQueue> findBySyncedBooleanOrderByCreatedAtAsc(Integer syncedBoolean);
}
