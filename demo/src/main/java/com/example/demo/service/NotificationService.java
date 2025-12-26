package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 通知服务类，负责发送 WebSocket 消息。
 */
@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * 发送新订单通知
     * 
     * @param orderId 订单ID
     * @param orderNo 订单号
     * @param amount  订单金额
     */
    public void sendNewOrderNotification(Long orderId, String orderNo, Double amount) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "NEW_ORDER");
        message.put("orderId", orderId);
        message.put("orderNo", orderNo);
        message.put("amount", amount);
        message.put("message", "收到新订单: " + orderNo + " (¥" + amount + ")");

        // 发送消息到 /topic/notifications
        messagingTemplate.convertAndSend("/topic/notifications", message);
    }
}
