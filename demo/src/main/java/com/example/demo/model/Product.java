package com.example.demo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Product实体类，代表一个商品。
 * @author FirstProject
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 商品ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 商品名称
     */
    @Column(nullable = false, length = 200)
    private String name;

    /**
     * 商品描述
     */
    @Column(length = 1000)
    private String description;

    /**
     * 标准价格（原价）
     */
    @Column(name = "standard_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal standardPrice;

    /**
     * 促销价格
     */
    @Column(name = "promotion_price", precision = 10, scale = 2)
    private BigDecimal promotionPrice;

    /**
     * 是否正在促销
     */
    @Column(name = "is_on_promotion")
    private Boolean isOnPromotion = false;

    /**
     * 库存数量
     */
    @Column(nullable = false)
    private Integer stock = 0;

    /**
     * 所属商品分类
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /**
     * 商品主图URL
     */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

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
     * 获取当前商品的有效价格。
     * 如果正在促销且促销价不为空，则返回促销价；否则返回标准价。
     * @return 当前有效价格
     */
    @com.fasterxml.jackson.annotation.JsonIgnore
    public BigDecimal getCurrentPrice() {
        if (Boolean.TRUE.equals(isOnPromotion) && promotionPrice != null) {
            return promotionPrice;
        }
        return standardPrice;
    }
}
