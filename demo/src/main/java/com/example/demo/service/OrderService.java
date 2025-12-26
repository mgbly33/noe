package com.example.demo.service;

import com.example.demo.model.Order;
import com.example.demo.model.Order.OrderStatus;
import com.example.demo.model.OrderItem;
import com.example.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * OrderService 类提供订单相关的业务逻辑。
 * 包括订单的创建、查询、状态流转等操作。
 * 
 * @author FirstProject
 * @version 1.0
 */
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * 获取所有订单，按创建时间降序排列。
     * 
     * @return 订单列表
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    // ... (omitted methods)

    /**
     * 创建一个新订单。
     * 此方法在一个事务中执行。
     * 
     * @param order 要创建的订单对象，包含订单项
     * @return 已创建并保存的订单
     */
    @Transactional
    public Order createOrder(Order order) {
        // 计算总金额
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            item.setOrder(order);
            if (item.getPrice() != null && item.getQuantity() != null) {
                item.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                total = total.add(item.getSubtotal());
            }
        }
        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        // 发送通知
        try {
            notificationService.sendNewOrderNotification(savedOrder.getId(), savedOrder.getOrderNo(),
                    savedOrder.getTotalAmount().doubleValue());
        } catch (Exception e) {
            // 通知失败不影响订单创建
            e.printStackTrace();
        }

        return savedOrder;
    }

    /**
     * 根据ID获取单个订单。
     * 
     * @param id 订单ID
     * @return 一个包含订单的Optional，如果找到的话
     */
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    /**
     * 根据订单号获取单个订单。
     * 
     * @param orderNo 订单号
     * @return 一个包含订单的Optional，如果找到的话
     */
    public Optional<Order> getOrderByOrderNo(String orderNo) {
        return orderRepository.findByOrderNo(orderNo);
    }

    /**
     * 根据订单状态获取订单列表。
     * 
     * @param status 订单状态
     * @return 对应状态的订单列表，按创建时间降序排列
     */
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    /**
     * 根据关键词搜索订单。
     * 
     * @param keyword 搜索关键词
     * @return 匹配的订单列表
     */
    public List<Order> searchOrders(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllOrders();
        }
        return orderRepository.search(keyword.trim());
    }

    /**
     * 支付订单，将订单状态从未支付更新为待发货。
     * 此方法在一个事务中执行。
     * 
     * @param id 订单ID
     * @return 更新后的订单
     * @throws RuntimeException 如果订单不存在或状态不正确
     */
    @Transactional
    public Order payOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在: " + id));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new RuntimeException("订单状态不正确，无法支付");
        }

        order.setStatus(OrderStatus.PENDING_SHIPMENT);
        order.setPaidAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    /**
     * 为订单发货，将订单状态更新为已发货，并记录物流信息。
     * 此方法在一个事务中执行。
     * 
     * @param id              订单ID
     * @param shippingCompany 物流公司
     * @param trackingNumber  物流单号
     * @return 更新后的订单
     * @throws RuntimeException 如果订单不存在或状态不正确
     */
    @Transactional
    public Order shipOrder(Long id, String shippingCompany, String trackingNumber) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在: " + id));

        if (order.getStatus() != OrderStatus.PENDING_SHIPMENT) {
            throw new RuntimeException("订单状态不正确，无法发货");
        }

        order.setStatus(OrderStatus.SHIPPED);
        order.setShippingCompany(shippingCompany);
        order.setTrackingNumber(trackingNumber);
        order.setShippedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    /**
     * 完成订单，将订单状态更新为已完成。
     * 此方法在一个事务中执行。
     * 
     * @param id 订单ID
     * @return 更新后的订单
     * @throws RuntimeException 如果订单不存在或状态不正确
     */
    @Transactional
    public Order completeOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在: " + id));

        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new RuntimeException("订单状态不正确，无法完成");
        }

        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    /**
     * 取消订单，将订单状态更新为已取消。
     * 此方法在一个事务中执行。
     * 
     * @param id 订单ID
     * @return 更新后的订单
     * @throws RuntimeException 如果订单不存在或状态不正确（如已发货或已完成）
     */
    @Transactional
    public Order cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在: " + id));

        if (order.getStatus() == OrderStatus.SHIPPED ||
                order.getStatus() == OrderStatus.COMPLETED ||
                order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("订单状态不正确，无法取消");
        }

        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    /**
     * 更新订单的备注信息。
     * 
     * @param id     订单ID
     * @param remark 新的备注内容
     * @return 更新后的订单
     * @throws RuntimeException 如果订单不存在
     */
    public Order updateRemark(Long id, String remark) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在: " + id));
        order.setRemark(remark);
        return orderRepository.save(order);
    }
}
