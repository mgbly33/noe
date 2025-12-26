package com.example.demo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Discount实体类，代表折扣活动。
 * @author FirstProject
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "discounts")
public class Discount implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 折扣ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 折扣活动名称
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * 折扣类型 (PERCENT: 百分比折扣, FIXED: 固定金额减免)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType type;

    /**
     * 折扣值。
     * 对于百分比折扣，表示折扣后的价格占原价的百分比 (例如, 85 表示85折)。
     * 对于固定金额减免，表示减去的金额。
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    /**
     * 折扣适用范围 (ALL: 全场, CATEGORY: 指定分类, PRODUCT: 指定商品)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountScope scope;

    /**
     * 适用的分类ID（当scope为CATEGORY时使用）
     */
    @Column(name = "category_id")
    private Long categoryId;

    /**
     * 适用的商品ID列表（当scope为PRODUCT时使用，多个ID用逗号分隔）
     */
    @Column(name = "product_ids", length = 1000)
    private String productIds;

    /**
     * 折扣活动开始时间
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * 折扣活动结束时间
     */
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    /**
     * 是否启用
     */
    @Column(nullable = false)
    private Boolean enabled = true;

    /**
     * 折扣活动描述
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
     * 检查当前折扣活动是否处于激活状态（在有效期内且已启用）。
     * @return 如果激活则返回true，否则返回false
     */
    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return enabled && now.isAfter(startTime) && now.isBefore(endTime);
    }

    /**
     * 折扣类型枚举
     */
    public enum DiscountType {
        /**
         * 百分比折扣 (例如: 85折)
         */
        PERCENT("折扣"),
        /**
         * 固定金额减免 (例如: 减10元)
         */
        FIXED("直减");

        private final String displayName;

        DiscountType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 折扣适用范围枚举
     */
    public enum DiscountScope {
        /**
         * 全场商品适用
         */
        ALL("全场"),
        /**
         * 指定分类下的商品适用
         */
        CATEGORY("指定分类"),
        /**
         * 指定的某些商品适用
         */
        PRODUCT("指定商品");

        private final String displayName;

        DiscountScope(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
