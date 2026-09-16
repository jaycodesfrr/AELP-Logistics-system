package com.aelp.repository;

import com.aelp.model.Expedition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface ExpeditionRepository extends JpaRepository<Expedition, String> {
    long countByStatusIn(Collection<String> statuses);
}
