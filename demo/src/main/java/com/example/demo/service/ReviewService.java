package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.model.Review;
import com.example.demo.model.Review.ReviewStatus;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * ReviewService 类提供商品评价相关的业务逻辑。
 * 包括评价的创建、查询、审核、回复和统计等功能。
 * @author FirstProject
 * @version 1.0
 */
@Service
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ProductRepository productRepository;

    /**
     * 根据筛选条件获取评价列表（分页）。
     * @param productId 商品ID (可选)
     * @param status 评价状态 (可选)
     * @param page 页码
     * @param size 每页数量
     * @return 评价的分页结果
     */
    public Page<Review> getReviews(Long productId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        ReviewStatus statusEnum = (status != null && !status.isEmpty()) ? ReviewStatus.valueOf(status) : null;
        return reviewRepository.findWithFilters(productId, statusEnum, pageable);
    }

    /**
     * 获取指定商品下所有已审核的评价（分页）。
     * @param productId 商品ID
     * @param page 页码
     * @param size 每页数量
     * @return 已审核评价的分页结果
     */
    public Page<Review> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.APPROVED, pageable);
    }

    /**
     * 根据ID获取单个评价。
     * @param id 评价ID
     * @return 一个包含评价的Optional
     */
    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    /**
     * 获取指定商品的评价统计信息。
     * @param productId 商品ID
     * @return 包含平均评分和总评价数的Map
     */
    public Map<String, Object> getProductReviewStats(Long productId) {
        Map<String, Object> stats = new HashMap<>();
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        Long count = reviewRepository.countApprovedByProductId(productId);
        stats.put("averageRating", avgRating != null ? Math.round(avgRating * 10) / 10.0 : 0);
        stats.put("totalCount", count);
        return stats;
    }

    /**
     * 创建一条新的评价。
     * @param review 要创建的评价对象
     * @return 已创建的评价，状态为待审核
     * @throws RuntimeException 如果订单商品已评价或评分无效
     */
    public Review createReview(Review review) {
        // 检查是否已评价
        if (review.getOrderId() != null && review.getProductId() != null) {
            if (reviewRepository.existsByOrderIdAndProductId(review.getOrderId(), review.getProductId())) {
                throw new RuntimeException("该订单商品已评价");
            }
        }
        
        // 获取商品名称
        if (review.getProductId() != null) {
            productRepository.findById(review.getProductId())
                    .ifPresent(p -> review.setProductName(p.getName()));
        }
        
        // 评分范围检查
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new RuntimeException("评分必须在1-5之间");
        }
        
        review.setStatus(ReviewStatus.PENDING);
        return reviewRepository.save(review);
    }

    /**
     * 更新指定ID的评价信息。
     * @param id 评价ID
     * @param reviewDetails 包含更新信息的评价对象
     * @return 更新后的评价
     * @throws RuntimeException 如果评价不存在
     */
    public Review updateReview(Long id, Review reviewDetails) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评价不存在: " + id));
        
        review.setRating(reviewDetails.getRating());
        review.setContent(reviewDetails.getContent());
        review.setImages(reviewDetails.getImages());
        review.setIsAnonymous(reviewDetails.getIsAnonymous());
        return reviewRepository.save(review);
    }

    /**
     * 审核通过指定ID的评价。
     * @param id 评价ID
     * @return 更新后的评价，状态为已通过
     * @throws RuntimeException 如果评价不存在
     */
    public Review approveReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评价不存在: " + id));
        review.setStatus(ReviewStatus.APPROVED);
        return reviewRepository.save(review);
    }

    /**
     * 拒绝指定ID的评价。
     * @param id 评价ID
     * @return 更新后的评价，状态为已拒绝
     * @throws RuntimeException 如果评价不存在
     */
    public Review rejectReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评价不存在: " + id));
        review.setStatus(ReviewStatus.REJECTED);
        return reviewRepository.save(review);
    }

    /**
     * 为指定ID的评价添加管理员回复。
     * @param id 评价ID
     * @param reply 回复内容
     * @return 更新后的评价
     * @throws RuntimeException 如果评价不存在
     */
    public Review replyReview(Long id, String reply) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评价不存在: " + id));
        review.setAdminReply(reply);
        review.setReplyAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    /**
     * 删除指定ID的评价。
     * @param id 评价ID
     * @throws RuntimeException 如果评价不存在
     */
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new RuntimeException("评价不存在: " + id);
        }
        reviewRepository.deleteById(id);
    }
}
