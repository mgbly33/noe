package com.example.demo.service;

import com.example.demo.model.Coupon;
import com.example.demo.model.Discount;
import com.example.demo.model.Product;
import com.example.demo.repository.CouponRepository;
import com.example.demo.repository.DiscountRepository;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

/**
 * PromotionService 类提供促销活动相关的业务逻辑。
 * 包括优惠券和折扣的管理、计算和应用。
 * @author FirstProject
 * @version 1.0
 */
@Service
public class PromotionService {
    
    @Autowired
    private CouponRepository couponRepository;
    
    @Autowired
    private DiscountRepository discountRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    // ========== 优惠券管理 ==========

    /**
     * 获取所有优惠券，按创建时间降序排列。
     * @return 优惠券列表
     */
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * 根据ID获取单个优惠券。
     * @param id 优惠券ID
     * @return 一个包含优惠券的Optional
     */
    public Optional<Coupon> getCouponById(Long id) {
        return couponRepository.findById(id);
    }

    /**
     * 根据优惠券代码获取单个优惠券。
     * @param code 优惠券代码
     * @return 一个包含优惠券的Optional
     */
    public Optional<Coupon> getCouponByCode(String code) {
        return couponRepository.findByCode(code);
    }

    /**
     * 获取所有当前有效的优惠券。
     * @return 有效优惠券的列表
     */
    public List<Coupon> getValidCoupons() {
        return couponRepository.findValidCoupons(LocalDateTime.now());
    }

    /**
     * 创建一张新的优惠券。
     * @param coupon 要创建的优惠券对象
     * @return 已创建的优惠券
     * @throws RuntimeException 如果优惠券代码已存在
     */
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new RuntimeException("优惠券码已存在: " + coupon.getCode());
        }
        return couponRepository.save(coupon);
    }

    /**
     * 更新指定ID的优惠券信息。
     * @param id 优惠券ID
     * @param couponDetails 包含更新信息的优惠券对象
     * @return 更新后的优惠券
     * @throws RuntimeException 如果优惠券不存在或新代码已存在
     */
    public Coupon updateCoupon(Long id, Coupon couponDetails) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("优惠券不存在: " + id));
        
        if (!coupon.getCode().equals(couponDetails.getCode()) 
                && couponRepository.existsByCode(couponDetails.getCode())) {
            throw new RuntimeException("优惠券码已存在: " + couponDetails.getCode());
        }
        
        coupon.setName(couponDetails.getName());
        coupon.setCode(couponDetails.getCode());
        coupon.setType(couponDetails.getType());
        coupon.setValue(couponDetails.getValue());
        coupon.setMinAmount(couponDetails.getMinAmount());
        coupon.setMaxDiscount(couponDetails.getMaxDiscount());
        coupon.setTotalCount(couponDetails.getTotalCount());
        coupon.setPerLimit(couponDetails.getPerLimit());
        coupon.setStartTime(couponDetails.getStartTime());
        coupon.setEndTime(couponDetails.getEndTime());
        coupon.setDescription(couponDetails.getDescription());
        return couponRepository.save(coupon);
    }

    /**
     * 切换指定ID优惠券的启用/禁用状态。
     * @param id 优惠券ID
     * @return 更新后的优惠券
     * @throws RuntimeException 如果优惠券不存在
     */
    public Coupon toggleCouponEnabled(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("优惠券不存在: " + id));
        coupon.setEnabled(!coupon.getEnabled());
        return couponRepository.save(coupon);
    }

    /**
     * 删除指定ID的优惠券。
     * @param id 优惠券ID
     * @throws RuntimeException 如果优惠券不存在
     */
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("优惠券不存在: " + id);
        }
        couponRepository.deleteById(id);
    }

    /**
     * 根据优惠券代码和订单金额计算折扣金额。
     * @param code 优惠券代码
     * @param orderAmount 订单总金额
     * @return 计算出的折扣金额
     * @throws RuntimeException 如果优惠券无效或未达到使用门槛
     */
    public BigDecimal calculateCouponDiscount(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("优惠券不存在"));
        
        if (!coupon.isValid()) {
            throw new RuntimeException("优惠券已失效");
        }
        
        if (coupon.getMinAmount() != null && orderAmount.compareTo(coupon.getMinAmount()) < 0) {
            throw new RuntimeException("未达到最低消费金额: " + coupon.getMinAmount());
        }
        
        BigDecimal discount;
        if (coupon.getType() == Coupon.CouponType.FIXED) {
            discount = coupon.getValue();
        } else {
            discount = orderAmount.multiply(BigDecimal.ONE.subtract(coupon.getValue().divide(BigDecimal.valueOf(100))));
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        }
        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    
    // ========== 折扣活动管理 ==========

    /**
     * 获取所有折扣活动，按创建时间降序排列。
     * @return 折扣活动列表
     */
    public List<Discount> getAllDiscounts() {
        return discountRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * 根据ID获取单个折扣活动。
     * @param id 折扣活动ID
     * @return 一个包含折扣活动的Optional
     */
    public Optional<Discount> getDiscountById(Long id) {
        return discountRepository.findById(id);
    }

    /**
     * 获取所有当前激活的折扣活动。
     * @return 激活的折扣活动列表
     */
    public List<Discount> getActiveDiscounts() {
        return discountRepository.findActiveDiscounts(LocalDateTime.now());
    }

    /**
     * 创建一个新的折扣活动。
     * @param discount 要创建的折扣活动对象
     * @return 已创建的折扣活动
     */
    public Discount createDiscount(Discount discount) {
        return discountRepository.save(discount);
    }

    /**
     * 更新指定ID的折扣活动信息。
     * @param id 折扣活动ID
     * @param discountDetails 包含更新信息的折扣活动对象
     * @return 更新后的折扣活动
     * @throws RuntimeException 如果折扣活动不存在
     */
    public Discount updateDiscount(Long id, Discount discountDetails) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("折扣活动不存在: " + id));
        
        discount.setName(discountDetails.getName());
        discount.setType(discountDetails.getType());
        discount.setValue(discountDetails.getValue());
        discount.setScope(discountDetails.getScope());
        discount.setCategoryId(discountDetails.getCategoryId());
        discount.setProductIds(discountDetails.getProductIds());
        discount.setStartTime(discountDetails.getStartTime());
        discount.setEndTime(discountDetails.getEndTime());
        discount.setDescription(discountDetails.getDescription());
        return discountRepository.save(discount);
    }

    /**
     * 切换指定ID折扣活动的启用/禁用状态。
     * @param id 折扣活动ID
     * @return 更新后的折扣活动
     * @throws RuntimeException 如果折扣活动不存在
     */
    public Discount toggleDiscountEnabled(Long id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("折扣活动不存在: " + id));
        discount.setEnabled(!discount.getEnabled());
        return discountRepository.save(discount);
    }

    /**
     * 删除指定ID的折扣活动。
     * @param id 折扣活动ID
     * @throws RuntimeException 如果折扣活动不存在
     */
    public void deleteDiscount(Long id) {
        if (!discountRepository.existsById(id)) {
            throw new RuntimeException("折扣活动不存在: " + id);
        }
        discountRepository.deleteById(id);
    }

    /**
     * 计算并获取单个商品的最佳折扣价。
     * @param product 商品对象
     * @return 应用最优惠折扣后的价格
     */
    public BigDecimal getDiscountedPrice(Product product) {
        List<Discount> discounts = discountRepository.findActiveDiscountsForProduct(
                LocalDateTime.now(), 
                product.getCategory().getId(), 
                product.getId().toString()
        );
        
        if (discounts.isEmpty()) {
            return product.getStandardPrice();
        }
        
        // 取最优惠的折扣
        BigDecimal bestPrice = product.getStandardPrice();
        for (Discount discount : discounts) {
            BigDecimal discountedPrice;
            if (discount.getType() == Discount.DiscountType.PERCENT) {
                discountedPrice = product.getStandardPrice()
                        .multiply(discount.getValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else {
                discountedPrice = product.getStandardPrice().subtract(discount.getValue());
                if (discountedPrice.compareTo(BigDecimal.ZERO) < 0) {
                    discountedPrice = BigDecimal.ZERO;
                }
            }
            if (discountedPrice.compareTo(bestPrice) < 0) {
                bestPrice = discountedPrice;
            }
        }
        return bestPrice;
    }

    /**
     * 获取所有商品及其当前的折扣信息。
     * @return 一个Map列表，每个Map包含商品对象、折扣价和是否有折扣的标志
     */
    public List<Map<String, Object>> getProductsWithDiscounts() {
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Product product : products) {
            Map<String, Object> item = new HashMap<>();
            item.put("product", product);
            item.put("discountedPrice", getDiscountedPrice(product));
            item.put("hasDiscount", getDiscountedPrice(product).compareTo(product.getStandardPrice()) < 0);
            result.add(item);
        }
        return result;
    }
}
