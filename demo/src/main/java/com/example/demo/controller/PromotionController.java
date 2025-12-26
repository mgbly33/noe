package com.example.demo.controller;

import com.example.demo.model.Coupon;
import com.example.demo.model.Coupon.CouponType;
import com.example.demo.model.Discount;
import com.example.demo.model.Discount.DiscountScope;
import com.example.demo.model.Discount.DiscountType;
import com.example.demo.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PromotionController 类负责处理所有与促销活动相关的API请求。
 * 包括优惠券和折扣的管理。
 * @author FirstProject
 * @version 1.0
 */
@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {
    
    @Autowired
    private PromotionService promotionService;

    // --- 优惠券管理 ---

    /**
     * 获取所有优惠券。
     * @return 优惠券列表
     */
    @GetMapping("/coupons")
    public List<Coupon> getAllCoupons() {
        return promotionService.getAllCoupons();
    }

    /**
     * 获取所有当前有效的优惠券。
     * @return 有效优惠券列表
     */
    @GetMapping("/coupons/valid")
    public List<Coupon> getValidCoupons() {
        return promotionService.getValidCoupons();
    }

    /**
     * 根据ID获取优惠券详情。
     * @param id 优惠券ID
     * @return 包含优惠券信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/coupons/{id}")
    public ResponseEntity<Coupon> getCouponById(@PathVariable Long id) {
        return promotionService.getCouponById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 根据优惠券代码获取优惠券详情。
     * @param code 优惠券代码
     * @return 包含优惠券信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/coupons/code/{code}")
    public ResponseEntity<Coupon> getCouponByCode(@PathVariable String code) {
        return promotionService.getCouponByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 创建一张新的优惠券。
     * @param request 包含优惠券信息的请求体
     * @return 包含已创建优惠券的ResponseEntity，如果创建失败则返回错误信息
     */
    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Map<String, Object> request) {
        try {
            Coupon coupon = new Coupon();
            coupon.setName((String) request.get("name"));
            coupon.setCode((String) request.get("code"));
            coupon.setType(CouponType.valueOf((String) request.get("type")));
            coupon.setValue(new BigDecimal(request.get("value").toString()));
            if (request.get("minAmount") != null) {
                coupon.setMinAmount(new BigDecimal(request.get("minAmount").toString()));
            }
            if (request.get("maxDiscount") != null) {
                coupon.setMaxDiscount(new BigDecimal(request.get("maxDiscount").toString()));
            }
            if (request.get("totalCount") != null) {
                coupon.setTotalCount(Integer.valueOf(request.get("totalCount").toString()));
            }
            if (request.get("perLimit") != null) {
                coupon.setPerLimit(Integer.valueOf(request.get("perLimit").toString()));
            }
            coupon.setStartTime(LocalDateTime.parse((String) request.get("startTime")));
            coupon.setEndTime(LocalDateTime.parse((String) request.get("endTime")));
            coupon.setDescription((String) request.get("description"));
            
            Coupon created = promotionService.createCoupon(coupon);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新指定ID的优惠券信息。
     * @param id 优惠券ID
     * @param request 包含更新信息的请求体
     * @return 包含更新后优惠券的ResponseEntity，如果更新失败则返回错误信息
     */
    @PutMapping("/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Coupon coupon = new Coupon();
            coupon.setName((String) request.get("name"));
            coupon.setCode((String) request.get("code"));
            coupon.setType(CouponType.valueOf((String) request.get("type")));
            coupon.setValue(new BigDecimal(request.get("value").toString()));
            if (request.get("minAmount") != null && !request.get("minAmount").toString().isEmpty()) {
                coupon.setMinAmount(new BigDecimal(request.get("minAmount").toString()));
            }
            if (request.get("maxDiscount") != null && !request.get("maxDiscount").toString().isEmpty()) {
                coupon.setMaxDiscount(new BigDecimal(request.get("maxDiscount").toString()));
            }
            if (request.get("totalCount") != null && !request.get("totalCount").toString().isEmpty()) {
                coupon.setTotalCount(Integer.valueOf(request.get("totalCount").toString()));
            }
            if (request.get("perLimit") != null) {
                coupon.setPerLimit(Integer.valueOf(request.get("perLimit").toString()));
            }
            coupon.setStartTime(LocalDateTime.parse((String) request.get("startTime")));
            coupon.setEndTime(LocalDateTime.parse((String) request.get("endTime")));
            coupon.setDescription((String) request.get("description"));
            
            Coupon updated = promotionService.updateCoupon(id, coupon);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 切换指定ID优惠券的启用/禁用状态。
     * @param id 优惠券ID
     * @return 包含更新后优惠券的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/coupons/{id}/toggle")
    public ResponseEntity<?> toggleCouponEnabled(@PathVariable Long id) {
        try {
            Coupon updated = promotionService.toggleCouponEnabled(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 删除指定ID的优惠券。
     * @param id 优惠券ID
     * @return 表示操作成功的ResponseEntity，如果删除失败则返回错误信息
     */
    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            promotionService.deleteCoupon(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 根据优惠券代码和订单金额计算折扣。
     * @param request 包含优惠券代码和订单金额的请求体
     * @return 包含折扣金额和最终金额的ResponseEntity
     */
    @PostMapping("/coupons/calculate")
    public ResponseEntity<?> calculateCouponDiscount(@RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("code");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            BigDecimal discount = promotionService.calculateCouponDiscount(code, amount);
            Map<String, Object> result = new HashMap<>();
            result.put("discount", discount);
            result.put("finalAmount", amount.subtract(discount));
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- 折扣活动管理 ---

    /**
     * 获取所有折扣活动。
     * @return 折扣活动列表
     */
    @GetMapping("/discounts")
    public List<Discount> getAllDiscounts() {
        return promotionService.getAllDiscounts();
    }

    /**
     * 获取所有当前激活的折扣活动。
     * @return 激活的折扣活动列表
     */
    @GetMapping("/discounts/active")
    public List<Discount> getActiveDiscounts() {
        return promotionService.getActiveDiscounts();
    }

    /**
     * 根据ID获取折扣活动详情。
     * @param id 折扣活动ID
     * @return 包含折扣活动信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/discounts/{id}")
    public ResponseEntity<Discount> getDiscountById(@PathVariable Long id) {
        return promotionService.getDiscountById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 创建一个新的折扣活动。
     * @param request 包含折扣活动信息的请求体
     * @return 包含已创建折扣活动的ResponseEntity，如果创建失败则返回错误信息
     */
    @PostMapping("/discounts")
    public ResponseEntity<?> createDiscount(@RequestBody Map<String, Object> request) {
        try {
            Discount discount = new Discount();
            discount.setName((String) request.get("name"));
            discount.setType(DiscountType.valueOf((String) request.get("type")));
            discount.setValue(new BigDecimal(request.get("value").toString()));
            discount.setScope(DiscountScope.valueOf((String) request.get("scope")));
            if (request.get("categoryId") != null && !request.get("categoryId").toString().isEmpty()) {
                discount.setCategoryId(Long.valueOf(request.get("categoryId").toString()));
            }
            discount.setProductIds((String) request.get("productIds"));
            discount.setStartTime(LocalDateTime.parse((String) request.get("startTime")));
            discount.setEndTime(LocalDateTime.parse((String) request.get("endTime")));
            discount.setDescription((String) request.get("description"));
            
            Discount created = promotionService.createDiscount(discount);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新指定ID的折扣活动信息。
     * @param id 折扣活动ID
     * @param request 包含更新信息的请求体
     * @return 包含更新后折扣活动的ResponseEntity，如果更新失败则返回错误信息
     */
    @PutMapping("/discounts/{id}")
    public ResponseEntity<?> updateDiscount(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Discount discount = new Discount();
            discount.setName((String) request.get("name"));
            discount.setType(DiscountType.valueOf((String) request.get("type")));
            discount.setValue(new BigDecimal(request.get("value").toString()));
            discount.setScope(DiscountScope.valueOf((String) request.get("scope")));
            if (request.get("categoryId") != null && !request.get("categoryId").toString().isEmpty()) {
                discount.setCategoryId(Long.valueOf(request.get("categoryId").toString()));
            }
            discount.setProductIds((String) request.get("productIds"));
            discount.setStartTime(LocalDateTime.parse((String) request.get("startTime")));
            discount.setEndTime(LocalDateTime.parse((String) request.get("endTime")));
            discount.setDescription((String) request.get("description"));
            
            Discount updated = promotionService.updateDiscount(id, discount);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 切换指定ID折扣活动的启用/禁用状态。
     * @param id 折扣活动ID
     * @return 包含更新后折扣活动的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/discounts/{id}/toggle")
    public ResponseEntity<?> toggleDiscountEnabled(@PathVariable Long id) {
        try {
            Discount updated = promotionService.toggleDiscountEnabled(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 删除指定ID的折扣活动。
     * @param id 折扣活动ID
     * @return 表示操作成功的ResponseEntity，如果删除失败则返回错误信息
     */
    @DeleteMapping("/discounts/{id}")
    public ResponseEntity<?> deleteDiscount(@PathVariable Long id) {
        try {
            promotionService.deleteDiscount(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取所有应用了有效折扣的商品及其最终价格。
     * @return 包含商品信息和折扣价的列表
     */
    @GetMapping("/products-with-discounts")
    public List<Map<String, Object>> getProductsWithDiscounts() {
        return promotionService.getProductsWithDiscounts();
    }
}
