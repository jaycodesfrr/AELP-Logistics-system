package com.aelp.repository;

import com.aelp.model.PersonnelMovementLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonnelMovementLogRepository extends JpaRepository<PersonnelMovementLog, String> {
}
