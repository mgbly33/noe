package com.example.demo.repository;

import com.example.demo.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * OrderItemRepository 是一个JPA仓库，用于处理订单项（OrderItem）的数据库操作。
 * @author FirstProject
 * @version 1.0
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * 根据订单ID查找所有相关的订单项。
     * @param orderId 订单ID
     * @return 属于该订单的所有订单项列表
     */
    List<OrderItem> findByOrderId(Long orderId);
}
