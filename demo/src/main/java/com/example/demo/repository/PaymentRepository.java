package com.example.demo.repository;

import com.example.demo.model.Payment;
import com.example.demo.model.Payment.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PaymentRepository 是一个JPA仓库，用于处理支付记录（Payment）的数据库操作。
 * @author FirstProject
 * @version 1.0
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * 根据支付单号查找支付记录。
     * @param paymentNo 支付单号
     * @return 一个包含支付记录的Optional，如果找到的话
     */
    Optional<Payment> findByPaymentNo(String paymentNo);

    /**
     * 根据订单ID查找所有相关的支付记录。
     * @param orderId 订单ID
     * @return 属于该订单的所有支付记录列表
     */
    List<Payment> findByOrderId(Long orderId);

    /**
     * 根据订单号查找所有相关的支付记录。
     * @param orderNo 订单号
     * @return 属于该订单的所有支付记录列表
     */
    List<Payment> findByOrderNo(String orderNo);

    /**
     * 根据支付状态查找支付记录列表。
     * @param status 支付状态
     * @return 匹配状态的支付记录列表
     */
    List<Payment> findByStatus(PaymentStatus status);

    /**
     * 根据订单ID和支付状态查找支付记录。
     * @param orderId 订单ID
     * @param status 支付状态
     * @return 一个包含支付记录的Optional，如果找到的话
     */
    Optional<Payment> findByOrderIdAndStatus(Long orderId, PaymentStatus status);

    /**
     * 查找所有支付记录，并按创建时间降序排列。
     * @return 排序后的支付记录列表
     */
    List<Payment> findAllByOrderByCreatedAtDesc();
}
