package com.aelp.repository;

import com.aelp.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, String> {
    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.quantity <= i.reorderThreshold")
    long countLowStockItems();

    Optional<InventoryItem> findByBarcode(String barcode);
}
