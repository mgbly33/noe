package com.example.demo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order实体类，代表一个客户订单。
 * @author FirstProject
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 订单ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 订单号，业务唯一键
     */
    @Column(name = "order_no", nullable = false, unique = true, length = 50)
    private String orderNo;

    /**
     * 订单状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    /**
     * 订单总金额
     */
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    /**
     * 买家姓名
     */
    @Column(name = "buyer_name", nullable = false, length = 100)
    private String buyerName;

    /**
     * 买家联系电话
     */
    @Column(name = "buyer_phone", nullable = false, length = 20)
    private String buyerPhone;

    /**
     * 买家收货地址
     */
    @Column(name = "buyer_address", nullable = false, length = 500)
    private String buyerAddress;

    /**
     * 订单备注
     */
    @Column(length = 500)
    private String remark;

    /**
     * 物流公司
     */
    @Column(name = "shipping_company", length = 100)
    private String shippingCompany;

    /**
     * 物流单号
     */
    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    /**
     * 订单包含的商品项列表
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    /**
     * 订单创建时间
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * 订单最后更新时间
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 支付完成时间
     */
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    /**
     * 发货时间
     */
    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    /**
     * 订单完成时间
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (orderNo == null) {
            orderNo = generateOrderNo();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 生成一个基于时间的、带随机数的唯一订单号。
     * @return 订单号字符串
     */
    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis() + (int) (Math.random() * 1000);
    }

    /**
     * 订单状态枚举
     */
    public enum OrderStatus {
        /**
         * 待支付
         */
        PENDING_PAYMENT("待支付"),
        /**
         * 待发货
         */
        PENDING_SHIPMENT("待发货"),
        /**
         * 已发货
         */
        SHIPPED("已发货"),
        /**
         * 已完成
         */
        COMPLETED("已完成"),
        /**
         * 已取消
         */
        CANCELLED("已取消");

        private final String displayName;

        OrderStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
