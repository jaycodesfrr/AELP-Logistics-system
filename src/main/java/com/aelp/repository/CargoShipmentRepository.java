package com.aelp.repository;

import com.aelp.model.CargoShipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CargoShipmentRepository extends JpaRepository<CargoShipment, String> {
}
