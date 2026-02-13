package com.restaurant.ordersystem.repository;

import com.restaurant.ordersystem.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByCustomerPhone(String customerPhone);
    
    List<Order> findAllByOrderByOrderDateDesc();
}
