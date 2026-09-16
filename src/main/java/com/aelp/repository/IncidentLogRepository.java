package com.aelp.repository;

import com.aelp.model.IncidentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncidentLogRepository extends JpaRepository<IncidentLog, String> {
}
