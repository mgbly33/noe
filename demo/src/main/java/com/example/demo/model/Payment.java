package com.example.demo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment实体类，代表一笔支付记录。
 * @author FirstProject
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
public class Payment implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 支付ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 支付单号，业务唯一键
     */
    @Column(name = "payment_no", nullable = false, unique = true, length = 64)
    private String paymentNo;

    /**
     * 关联的订单ID
     */
    @Column(name = "order_id", nullable = false)
    private Long orderId;

    /**
     * 关联的订单号（冗余字段）
     */
    @Column(name = "order_no", nullable = false, length = 50)
    private String orderNo;

    /**
     * 支付方式
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    /**
     * 支付金额
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * 支付状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    /**
     * 第三方支付平台的交易号（模拟）
     */
    @Column(name = "transaction_id", length = 64)
    private String transactionId;

    /**
     * 支付失败时的错误信息
     */
    @Column(name = "error_message", length = 500)
    private String errorMessage;

    /**
     * 记录创建时间
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * 支付成功时间
     */
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (paymentNo == null) {
            paymentNo = generatePaymentNo();
        }
    }

    /**
     * 生成一个基于时间的、带随机数的唯一支付单号。
     * @return 支付单号字符串
     */
    private String generatePaymentNo() {
        return "PAY" + System.currentTimeMillis() + (int) (Math.random() * 10000);
    }

    /**
     * 支付方式枚举
     */
    public enum PaymentMethod {
        ALIPAY("支付宝"),
        WECHAT("微信支付"),
        UNIONPAY("银联支付"),
        BALANCE("余额支付");

        private final String displayName;

        PaymentMethod(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 支付状态枚举
     */
    public enum PaymentStatus {
        PENDING("待支付"),
        PROCESSING("处理中"),
        SUCCESS("支付成功"),
        FAILED("支付失败"),
        CANCELLED("已取消"),
        REFUNDED("已退款");

        private final String displayName;

        PaymentStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
