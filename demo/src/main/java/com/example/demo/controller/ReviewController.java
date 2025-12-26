package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

/**
 * ReviewController 类负责处理与商品评价相关的API请求。
 * 包括评价的创建、查询、审核、回复等。
 * @author FirstProject
 * @version 1.0
 */
@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;

    /**
     * 获取评价列表，支持分页和按商品ID、状态筛选。
     * @param productId 商品ID，可选
     * @param status 评价状态，可选
     * @param page 页码
     * @param size 每页数量
     * @return 评价的分页结果
     */
    @GetMapping
    public Page<Review> getReviews(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return reviewService.getReviews(productId, status, page, size);
    }

    /**
     * 获取指定商品的所有已审核评价（分页）。
     * @param productId 商品ID
     * @param page 页码
     * @param size 每页数量
     * @return 商品评价的分页结果
     */
    @GetMapping("/product/{productId}")
    public Page<Review> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return reviewService.getProductReviews(productId, page, size);
    }

    /**
     * 获取指定商品的评价统计信息（总数、平均分等）。
     * @param productId 商品ID
     * @return 包含评价统计信息的Map
     */
    @GetMapping("/product/{productId}/stats")
    public Map<String, Object> getProductReviewStats(@PathVariable Long productId) {
        return reviewService.getProductReviewStats(productId);
    }

    /**
     * 根据ID获取单条评价详情。
     * @param id 评价ID
     * @return 包含评价信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        return reviewService.getReviewById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 创建一条新的评价。
     * @param request 包含评价信息的请求体
     * @return 包含已创建评价的ResponseEntity，如果创建失败则返回错误信息
     */
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> request) {
        try {
            Review review = new Review();
            review.setProductId(Long.valueOf(request.get("productId").toString()));
            if (request.get("orderId") != null) {
                review.setOrderId(Long.valueOf(request.get("orderId").toString()));
            }
            if (request.get("userId") != null) {
                review.setUserId(Long.valueOf(request.get("userId").toString()));
            }
            review.setUserName((String) request.get("userName"));
            review.setRating(Integer.valueOf(request.get("rating").toString()));
            review.setContent((String) request.get("content"));
            review.setImages((String) request.get("images"));
            review.setIsAnonymous(request.get("isAnonymous") != null && (Boolean) request.get("isAnonymous"));
            
            Review created = reviewService.createReview(review);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * 更新指定ID的评价信息。
     * @param id 评价ID
     * @param request 包含更新信息的请求体
     * @return 包含更新后评价的ResponseEntity，如果更新失败则返回错误信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Review review = new Review();
            review.setRating(Integer.valueOf(request.get("rating").toString()));
            review.setContent((String) request.get("content"));
            review.setImages((String) request.get("images"));
            review.setIsAnonymous(request.get("isAnonymous") != null && (Boolean) request.get("isAnonymous"));
            
            Review updated = reviewService.updateReview(id, review);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * 审核通过指定ID的评价。
     * @param id 评价ID
     * @return 包含更新后评价的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveReview(@PathVariable Long id) {
        try {
            Review review = reviewService.approveReview(id);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * 拒绝指定ID的评价。
     * @param id 评价ID
     * @return 包含更新后评价的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectReview(@PathVariable Long id) {
        try {
            Review review = reviewService.rejectReview(id);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * 回复指定ID的评价。
     * @param id 评价ID
     * @param request 包含回复内容的请求体
     * @return 包含更新后评价的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/reply")
    public ResponseEntity<?> replyReview(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Review review = reviewService.replyReview(id, request.get("reply"));
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * 删除指定ID的评价。
     * @param id 评价ID
     * @return 表示操作成功的ResponseEntity，如果删除失败则返回错误信息
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
