package com.example.demo.controller;

import com.example.demo.model.Order;
import com.example.demo.model.Order.OrderStatus;
import com.example.demo.model.OrderItem;
import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * OrderController 类负责处理所有与订单相关的API请求。
 * 包括订单的创建、查询、状态更新等。
 * @author FirstProject
 * @version 1.0
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;

    /**
     * 获取订单列表，可根据状态或关键词进行筛选。
     * @param status 订单状态，可选
     * @param keyword 搜索关键词，可选
     * @return 订单列表
     */
    @GetMapping
    public List<Order> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return orderService.searchOrders(keyword);
        }
        if (status != null && !status.isEmpty()) {
            return orderService.getOrdersByStatus(OrderStatus.valueOf(status));
        }
        return orderService.getAllOrders();
    }

    /**
     * 根据ID获取订单详情。
     * @param id 订单ID
     * @return 包含订单信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 根据订单号获取订单详情。
     * @param orderNo 订单号
     * @return 包含订单信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/no/{orderNo}")
    public ResponseEntity<Order> getOrderByOrderNo(@PathVariable String orderNo) {
        return orderService.getOrderByOrderNo(orderNo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 创建一个新订单。
     * @param request 包含订单信息的请求体
     * @return 包含已创建订单的ResponseEntity，如果创建失败则返回错误信息
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            Order order = new Order();
            order.setBuyerName((String) request.get("buyerName"));
            order.setBuyerPhone((String) request.get("buyerPhone"));
            order.setBuyerAddress((String) request.get("buyerAddress"));
            order.setRemark((String) request.get("remark"));
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) request.get("items");
            for (Map<String, Object> itemData : itemsData) {
                OrderItem item = new OrderItem();
                item.setProductId(Long.valueOf(itemData.get("productId").toString()));
                item.setProductName((String) itemData.get("productName"));
                item.setProductImage((String) itemData.get("productImage"));
                item.setPrice(new BigDecimal(itemData.get("price").toString()));
                item.setQuantity(Integer.valueOf(itemData.get("quantity").toString()));
                order.getItems().add(item);
            }
            
            Order created = orderService.createOrder(order);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 支付指定ID的订单。
     * @param id 订单ID
     * @return 包含更新后订单的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/pay")
    public ResponseEntity<?> payOrder(@PathVariable Long id) {
        try {
            Order order = orderService.payOrder(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 为指定ID的订单发货。
     * @param id 订单ID
     * @param request 包含运输公司和运单号的请求体
     * @return 包含更新后订单的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/ship")
    public ResponseEntity<?> shipOrder(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String shippingCompany = request.get("shippingCompany");
            String trackingNumber = request.get("trackingNumber");
            Order order = orderService.shipOrder(id, shippingCompany, trackingNumber);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 完成指定ID的订单。
     * @param id 订单ID
     * @return 包含更新后订单的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long id) {
        try {
            Order order = orderService.completeOrder(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 取消指定ID的订单。
     * @param id 订单ID
     * @return 包含更新后订单的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            Order order = orderService.cancelOrder(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新指定ID的订单备注。
     * @param id 订单ID
     * @param request 包含新备注的请求体
     * @return 包含更新后订单的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/remark")
    public ResponseEntity<?> updateRemark(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Order order = orderService.updateRemark(id, request.get("remark"));
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取所有可用的订单状态。
     * @return 订单状态枚举数组
     */
    @GetMapping("/statuses")
    public OrderStatus[] getOrderStatuses() {
        return OrderStatus.values();
    }
}
