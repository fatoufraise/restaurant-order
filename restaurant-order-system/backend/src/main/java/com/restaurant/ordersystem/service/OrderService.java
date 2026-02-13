package com.restaurant.ordersystem.service;

import com.restaurant.ordersystem.dto.OrderRequest;
import com.restaurant.ordersystem.model.MenuItem;
import com.restaurant.ordersystem.model.Order;
import com.restaurant.ordersystem.model.OrderItem;
import com.restaurant.ordersystem.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final MenuItemService menuItemService;
    private final NotificationService notificationService;
    
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }
    
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }
    
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    public List<Order> getOrdersByPhone(String phone) {
        return orderRepository.findByCustomerPhone(phone);
    }
    
    @Transactional
    public Order createOrder(OrderRequest orderRequest) {
        Order order = new Order();
        order.setCustomerName(orderRequest.getCustomerName());
        order.setCustomerPhone(orderRequest.getCustomerPhone());
        order.setCustomerAddress(orderRequest.getCustomerAddress());
        order.setNotes(orderRequest.getNotes());
        
        double totalAmount = 0.0;
        
        for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
            MenuItem menuItem = menuItemService.getMenuItemById(itemRequest.getMenuItemId());
            
            if (!menuItem.getAvailable() || menuItem.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Item not available: " + menuItem.getName());
            }
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(menuItem.getPrice());
            
            order.getOrderItems().add(orderItem);
            totalAmount += orderItem.getSubtotal();
            
            // Mettre à jour le stock
            menuItemService.updateStock(menuItem.getId(), itemRequest.getQuantity());
        }
        
        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        
        // Envoyer notification
        notificationService.sendOrderNotification(savedOrder);
        
        return savedOrder;
    }
    
    @Transactional
    public Order updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        // Envoyer notification de changement de statut
        notificationService.sendStatusNotification(updatedOrder);
        
        return updatedOrder;
    }
    
    @Transactional
    public void cancelOrder(Long id) {
        Order order = getOrderById(id);
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        // Restaurer le stock
        for (OrderItem item : order.getOrderItems()) {
            MenuItem menuItem = item.getMenuItem();
            menuItem.setStock(menuItem.getStock() + item.getQuantity());
            menuItem.setAvailable(true);
            menuItemService.updateMenuItem(menuItem.getId(), menuItem);
        }
    }
}
