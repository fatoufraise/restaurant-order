package com.restaurant.ordersystem.service;

import com.restaurant.ordersystem.model.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public void sendOrderNotification(Order order) {
        messagingTemplate.convertAndSend("/topic/orders", order);
    }
    
    public void sendStatusNotification(Order order) {
        messagingTemplate.convertAndSend("/topic/status/" + order.getId(), order);
    }
}
