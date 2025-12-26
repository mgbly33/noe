package com.example.demo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Coupon实体类，代表优惠券。
 * @author FirstProject
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "coupons")
public class Coupon implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 优惠券ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 优惠券名称
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * 优惠券代码，必须唯一，用于用户兑换
     */
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    /**
     * 优惠券类型 (FIXED: 满减券, PERCENT: 折扣券)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CouponType type;

    /**
     * 优惠券面值。
     * 对于满减券，表示减免的金额。
     * 对于折扣券，表示折扣的百分比 (例如, 90 表示 9折)。
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    /**
     * 最低消费金额，达到此金额才能使用优惠券
     */
    @Column(name = "min_amount", precision = 10, scale = 2)
    private BigDecimal minAmount;

    /**
     * 最大优惠金额，仅对折扣券有效
     */
    @Column(name = "max_discount", precision = 10, scale = 2)
    private BigDecimal maxDiscount;

    /**
     * 发放总量，null表示不限量
     */
    @Column(name = "total_count")
    private Integer totalCount;

    /**
     * 已领取（或已使用）数量
     */
    @Column(name = "used_count")
    private Integer usedCount = 0;

    /**
     * 每人限领数量
     */
    @Column(name = "per_limit")
    private Integer perLimit = 1;

    /**
     * 优惠券可用开始时间
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * 优惠券可用结束时间
     */
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    /**
     * 是否启用
     */
    @Column(nullable = false)
    private Boolean enabled = true;

    /**
     * 优惠券描述
     */
    @Column(length = 500)
    private String description;

    /**
     * 创建时间
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 检查当前优惠券是否有效（在有效期内、已启用、未领完）。
     * @return 如果有效则返回true，否则返回false
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return enabled && now.isAfter(startTime) && now.isBefore(endTime)
                && (totalCount == null || usedCount < totalCount);
    }

    /**
     * 优惠券类型枚举
     */
    public enum CouponType {
        /**
         * 满减券
         */
        FIXED("满减券"),
        /**
         * 折扣券
         */
        PERCENT("折扣券");

        private final String displayName;

        CouponType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
