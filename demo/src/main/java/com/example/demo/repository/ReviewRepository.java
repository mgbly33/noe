package com.example.demo.repository;

import com.example.demo.model.Review;
import com.example.demo.model.Review.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ReviewRepository 是一个JPA仓库，用于处理商品评价（Review）的数据库操作。
 * @author FirstProject
 * @version 1.0
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * 根据商品ID查找评价列表（分页）。
     * @param productId 商品ID
     * @param pageable 分页信息
     * @return 评价的分页结果
     */
    Page<Review> findByProductId(Long productId, Pageable pageable);

    /**
     * 根据用户ID查找评价列表（分页）。
     * @param userId 用户ID
     * @param pageable 分页信息
     * @return 评价的分页结果
     */
    Page<Review> findByUserId(Long userId, Pageable pageable);

    /**
     * 根据审核状态查找评价列表（分页）。
     * @param status 审核状态
     * @param pageable 分页信息
     * @return 评价的分页结果
     */
    Page<Review> findByStatus(ReviewStatus status, Pageable pageable);

    /**
     * 根据商品ID和审核状态查找评价列表（分页）。
     * @param productId 商品ID
     * @param status 审核状态
     * @param pageable 分页信息
     * @return 评价的分页结果
     */
    Page<Review> findByProductIdAndStatus(Long productId, ReviewStatus status, Pageable pageable);

    /**
     * 根据订单ID查找所有相关的评价。
     * @param orderId 订单ID
     * @return 该订单的评价列表
     */
    List<Review> findByOrderId(Long orderId);

    /**
     * 计算指定商品的平均评分（仅限已通过的评价）。
     * @param productId 商品ID
     * @return 商品的平均评分
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.productId = :productId AND r.status = 'APPROVED'")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    /**
     * 计算指定商品的已通过评价总数。
     * @param productId 商品ID
     * @return 已通过的评价数量
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.productId = :productId AND r.status = 'APPROVED'")
    Long countApprovedByProductId(@Param("productId") Long productId);

    /**
     * 根据动态筛选条件查找评价（分页）。
     * @param productId 商品ID (可选)
     * @param status 审核状态 (可选)
     * @param pageable 分页信息
     * @return 经过筛选和分页的评价结果
     */
    @Query("SELECT r FROM Review r WHERE " +
           "(:productId IS NULL OR r.productId = :productId) AND " +
           "(:status IS NULL OR r.status = :status)")
    Page<Review> findWithFilters(@Param("productId") Long productId, 
                                  @Param("status") ReviewStatus status, 
                                  Pageable pageable);

    /**
     * 检查指定的订单和商品组合是否已存在评价。
     * @param orderId 订单ID
     * @param productId 商品ID
     * @return 如果已存在评价则返回true，否则返回false
     */
    boolean existsByOrderIdAndProductId(Long orderId, Long productId);
}
