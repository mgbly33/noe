package com.example.demo.repository;

import com.example.demo.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * CouponRepository 是一个JPA仓库，用于处理优惠券（Coupon）的数据库操作。
 * @author FirstProject
 * @version 1.0
 */
@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    /**
     * 根据优惠券代码查找优惠券。
     * @param code 优惠券代码
     * @return 一个包含优惠券的Optional，如果找到的话
     */
    Optional<Coupon> findByCode(String code);

    /**
     * 检查是否存在指定代码的优惠券。
     * @param code 优惠券代码
     * @return 如果存在则返回true，否则返回false
     */
    boolean existsByCode(String code);

    /**
     * 根据启用状态查找优惠券。
     * @param enabled 启用状态
     * @return 匹配启用状态的优惠券列表
     */
    List<Coupon> findByEnabled(Boolean enabled);

    /**
     * 查找所有当前有效的优惠券。
     * 有效条件：已启用、在活动时间内、未领完。
     * @param now 当前时间
     * @return 当前有效的优惠券列表
     */
    @Query("SELECT c FROM Coupon c WHERE c.enabled = true AND c.startTime <= :now AND c.endTime >= :now AND (c.totalCount IS NULL OR c.usedCount < c.totalCount)")
    List<Coupon> findValidCoupons(LocalDateTime now);

    /**
     * 查找所有优惠券，并按创建时间降序排列。
     * @return 排序后的优惠券列表
     */
    List<Coupon> findAllByOrderByCreatedAtDesc();
}
