package com.aelp.repository;

import com.aelp.model.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonnelRepository extends JpaRepository<Personnel, String> {
    long countByCurrentStatus(String currentStatus);
    List<Personnel> findByCertificationsJsonContainingIgnoreCase(String skillQuery);
}
