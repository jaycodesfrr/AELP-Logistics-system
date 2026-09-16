package com.aelp.repository;

import com.aelp.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {
    long countByStatusNot(String status);
    List<Incident> findAllByOrderByCreatedAtDesc();
}
