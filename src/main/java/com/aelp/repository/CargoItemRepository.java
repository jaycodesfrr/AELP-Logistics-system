package com.aelp.repository;

import com.aelp.model.CargoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CargoItemRepository extends JpaRepository<CargoItem, String> {
    Optional<CargoItem> findByBarcode(String barcode);
}
