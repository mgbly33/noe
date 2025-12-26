package com.example.demo.repository;

import com.example.demo.model.Discount;
import com.example.demo.model.Discount.DiscountScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DiscountRepository 是一个JPA仓库，用于处理折扣活动（Discount）的数据库操作。
 * @author FirstProject
 * @version 1.0
 */
@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {

    /**
     * 根据启用状态查找折扣活动。
     * @param enabled 启用状态
     * @return 匹配启用状态的折扣活动列表
     */
    List<Discount> findByEnabled(Boolean enabled);

    /**
     * 查找所有当前激活的折扣活动。
     * 激活条件：已启用且在活动时间内。
     * @param now 当前时间
     * @return 激活的折扣活动列表
     */
    @Query("SELECT d FROM Discount d WHERE d.enabled = true AND d.startTime <= :now AND d.endTime >= :now")
    List<Discount> findActiveDiscounts(LocalDateTime now);

    /**
     * 根据范围查找所有当前激活的折扣活动。
     * @param now 当前时间
     * @param scope 折扣范围
     * @return 匹配范围的激活折扣活动列表
     */
    @Query("SELECT d FROM Discount d WHERE d.enabled = true AND d.startTime <= :now AND d.endTime >= :now AND d.scope = :scope")
    List<Discount> findActiveDiscountsByScope(LocalDateTime now, DiscountScope scope);

    /**
     * 查找适用于特定商品的所有当前激活的折扣活动。
     * @param now 当前时间
     * @param categoryId 商品所属的分类ID
     * @param productId 商品ID
     * @return 适用于该商品的激活折扣活动列表
     */
    @Query("SELECT d FROM Discount d WHERE d.enabled = true AND d.startTime <= :now AND d.endTime >= :now AND (d.scope = 'ALL' OR (d.scope = 'CATEGORY' AND d.categoryId = :categoryId) OR (d.scope = 'PRODUCT' AND d.productIds LIKE %:productId%))")
    List<Discount> findActiveDiscountsForProduct(@Param("now") LocalDateTime now, @Param("categoryId") Long categoryId, @Param("productId") String productId);

    /**
     * 查找所有折扣活动，并按创建时间降序排列。
     * @return 排序后的折扣活动列表
     */
    List<Discount> findAllByOrderByCreatedAtDesc();
}
