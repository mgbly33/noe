package com.example.demo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Review实体类，代表一条商品评价。
 * @author FirstProject
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reviews")
public class Review implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 评价ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 关联的商品ID
     */
    @Column(name = "product_id", nullable = false)
    private Long productId;

    /**
     * 商品名称（冗余字段）
     */
    @Column(name = "product_name", length = 200)
    private String productName;

    /**
     * 关联的订单ID
     */
    @Column(name = "order_id")
    private Long orderId;

    /**
     * 发表评价的用户ID
     */
    @Column(name = "user_id")
    private Long userId;

    /**
     * 用户名（冗余字段，可以是昵称）
     */
    @Column(name = "user_name", length = 50)
    private String userName;

    /**
     * 评分，范围为1到5
     */
    @Column(nullable = false)
    private Integer rating;

    /**
     * 评价内容
     */
    @Column(nullable = false, length = 2000)
    private String content;

    /**
     * 评价图片URL，多个URL之间用逗号分隔
     */
    @Column(length = 2000)
    private String images;

    /**
     * 是否为匿名评价
     */
    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    /**
     * 评价的审核状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status = ReviewStatus.PENDING;

    /**
     * 管理员的回复内容
     */
    @Column(name = "admin_reply", length = 1000)
    private String adminReply;

    /**
     * 管理员回复的时间
     */
    @Column(name = "reply_at")
    private LocalDateTime replyAt;

    /**
     * 评价创建时间
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * 评价最后更新时间
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
     * 评价审核状态枚举
     */
    public enum ReviewStatus {
        /**
         * 待审核
         */
        PENDING("待审核"),
        /**
         * 审核通过
         */
        APPROVED("已通过"),
        /**
         * 审核拒绝
         */
        REJECTED("已拒绝");

        private final String displayName;

        ReviewStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
