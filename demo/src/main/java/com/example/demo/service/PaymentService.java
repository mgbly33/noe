package com.example.demo.service;

import com.example.demo.model.Order;
import com.example.demo.model.Order.OrderStatus;
import com.example.demo.model.Payment;
import com.example.demo.model.Payment.PaymentMethod;
import com.example.demo.model.Payment.PaymentStatus;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * PaymentService 类提供支付相关的业务逻辑。
 * 包括创建支付、执行支付、查询状态、退款等。
 * 该服务中的支付流程为模拟流程，用于演示和测试。
 * @author FirstProject
 * @version 1.0
 */
@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    // 模拟支付成功率（80%成功）
    private static final double SUCCESS_RATE = 0.8;
    
    // 模拟支付处理延迟（毫秒）
    private static final long PROCESS_DELAY = 1000;

    /**
     * 获取所有支付记录，按创建时间降序排列。
     * @return 支付记录列表
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * 根据ID获取支付记录。
     * @param id 支付ID
     * @return 一个包含支付记录的Optional
     */
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    /**
     * 根据支付号获取支付记录。
     * @param paymentNo 支付号
     * @return 一个包含支付记录的Optional
     */
    public Optional<Payment> getPaymentByPaymentNo(String paymentNo) {
        return paymentRepository.findByPaymentNo(paymentNo);
    }

    /**
     * 根据订单ID获取相关的所有支付记录。
     * @param orderId 订单ID
     * @return 该订单的支付记录列表
     */
    public List<Payment> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    /**
     * 为指定订单创建一笔支付记录。
     * @param orderId 订单ID
     * @param paymentMethod 支付方式
     * @return 已创建的支付记录
     * @throws RuntimeException 如果订单不存在、状态不正确或已有待处理的支付
     */
    @Transactional
    public Payment createPayment(Long orderId, PaymentMethod paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在: " + orderId));
        
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new RuntimeException("订单状态不正确，无法支付");
        }
        
        // 检查是否有未完成的支付
        Optional<Payment> existingPayment = paymentRepository.findByOrderIdAndStatus(orderId, PaymentStatus.PENDING);
        if (existingPayment.isPresent()) {
            throw new RuntimeException("存在未完成的支付，请先取消或等待完成");
        }
        
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setOrderNo(order.getOrderNo());
        payment.setPaymentMethod(paymentMethod);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        
        return paymentRepository.save(payment);
    }

    /**
     * 模拟执行一笔支付。
     * 支付会经历一个短暂的处理中状态，然后根据随机数模拟成功或失败。
     * @param paymentNo 支付号
     * @return 包含支付结果信息的Map
     * @throws RuntimeException 如果支付记录不存在或状态不正确
     */
    @Transactional
    public Map<String, Object> executePayment(String paymentNo) {
        Payment payment = paymentRepository.findByPaymentNo(paymentNo)
                .orElseThrow(() -> new RuntimeException("支付记录不存在: " + paymentNo));
        
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("支付状态不正确，无法执行支付");
        }
        
        // 更新为处理中
        payment.setStatus(PaymentStatus.PROCESSING);
        paymentRepository.save(payment);
        
        // 模拟支付处理延迟
        try {
            Thread.sleep(PROCESS_DELAY);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("paymentNo", paymentNo);
        result.put("orderNo", payment.getOrderNo());
        result.put("amount", payment.getAmount());
        result.put("paymentMethod", payment.getPaymentMethod().getDisplayName());
        
        // 模拟支付结果
        boolean success = Math.random() < SUCCESS_RATE;
        
        if (success) {
            return processPaymentSuccess(payment, result);
        } else {
            return processPaymentFailure(payment, result);
        }
    }

    /**
     * 内部方法，处理支付成功的逻辑。
     * @param payment 支付对象
     * @param result 用于返回给客户端的结果Map
     * @return 更新后的结果Map
     */
    private Map<String, Object> processPaymentSuccess(Payment payment, Map<String, Object> result) {
        // 生成模拟交易号
        String transactionId = generateTransactionId(payment.getPaymentMethod());
        
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setTransactionId(transactionId);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
        
        // 更新订单状态
        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        order.setStatus(OrderStatus.PENDING_SHIPMENT);
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);
        
        result.put("success", true);
        result.put("status", PaymentStatus.SUCCESS.getDisplayName());
        result.put("transactionId", transactionId);
        result.put("paidAt", payment.getPaidAt());
        result.put("message", "支付成功");
        
        return result;
    }

    /**
     * 内部方法，处理支付失败的逻辑。
     * @param payment 支付对象
     * @param result 用于返回给客户端的结果Map
     * @return 更新后的结果Map
     */
    private Map<String, Object> processPaymentFailure(Payment payment, Map<String, Object> result) {
        String errorMessage = getRandomErrorMessage();
        
        payment.setStatus(PaymentStatus.FAILED);
        payment.setErrorMessage(errorMessage);
        paymentRepository.save(payment);
        
        result.put("success", false);
        result.put("status", PaymentStatus.FAILED.getDisplayName());
        result.put("errorCode", "PAY_FAILED");
        result.put("message", errorMessage);
        
        return result;
    }

    /**
     * 根据支付方式生成一个模拟的交易流水号。
     * @param method 支付方式
     * @return 模拟交易号
     */
    private String generateTransactionId(PaymentMethod method) {
        String prefix;
        switch (method) {
            case ALIPAY: prefix = "ALI"; break;
            case WECHAT: prefix = "WX"; break;
            case UNIONPAY: prefix = "UP"; break;
            default: prefix = "BAL"; break;
        }
        return prefix + System.currentTimeMillis() + (int)(Math.random() * 100000);
    }

    /**
     * 从预设列表中随机获取一条支付失败的错误信息。
     * @return 随机错误信息字符串
     */
    private String getRandomErrorMessage() {
        String[] errors = {
            "余额不足，请充值后重试",
            "银行系统繁忙，请稍后重试",
            "支付超时，请重新发起支付",
            "风控拦截，请联系客服",
            "网络异常，请检查网络后重试"
        };
        return errors[(int)(Math.random() * errors.length)];
    }

    /**
     * 取消一笔支付。
     * 只能取消处于“待处理”或“处理中”状态的支付。
     * @param paymentNo 支付号
     * @return 更新后的支付对象
     * @throws RuntimeException 如果支付记录不存在或状态不允许取消
     */
    @Transactional
    public Payment cancelPayment(String paymentNo) {
        Payment payment = paymentRepository.findByPaymentNo(paymentNo)
                .orElseThrow(() -> new RuntimeException("支付记录不存在: " + paymentNo));
        
        if (payment.getStatus() != PaymentStatus.PENDING && payment.getStatus() != PaymentStatus.PROCESSING) {
            throw new RuntimeException("当前状态无法取消支付");
        }
        
        payment.setStatus(PaymentStatus.CANCELLED);
        return paymentRepository.save(payment);
    }

    /**
     * 查询支付状态。
     * @param paymentNo 支付号
     * @return 包含支付详细状态的Map
     * @throws RuntimeException 如果支付记录不存在
     */
    public Map<String, Object> queryPaymentStatus(String paymentNo) {
        Payment payment = paymentRepository.findByPaymentNo(paymentNo)
                .orElseThrow(() -> new RuntimeException("支付记录不存在: " + paymentNo));
        
        Map<String, Object> result = new HashMap<>();
        result.put("paymentNo", payment.getPaymentNo());
        result.put("orderNo", payment.getOrderNo());
        result.put("amount", payment.getAmount());
        result.put("paymentMethod", payment.getPaymentMethod().getDisplayName());
        result.put("status", payment.getStatus());
        result.put("statusText", payment.getStatus().getDisplayName());
        result.put("transactionId", payment.getTransactionId());
        result.put("errorMessage", payment.getErrorMessage());
        result.put("createdAt", payment.getCreatedAt());
        result.put("paidAt", payment.getPaidAt());
        
        return result;
    }

    /**
     * 模拟退款流程。
     * @param paymentNo 支付号
     * @param refundAmount 退款金额。如果为null或大于支付金额，则全额退款。
     * @return 包含退款结果信息的Map
     * @throws RuntimeException 如果支付记录不存在或不是成功状态
     */
    @Transactional
    public Map<String, Object> refundPayment(String paymentNo, BigDecimal refundAmount) {
        Payment payment = paymentRepository.findByPaymentNo(paymentNo)
                .orElseThrow(() -> new RuntimeException("支付记录不存在: " + paymentNo));
        
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("只有支付成功的订单才能退款");
        }
        
        if (refundAmount == null || refundAmount.compareTo(payment.getAmount()) > 0) {
            refundAmount = payment.getAmount();
        }
        
        // 模拟退款处理
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("paymentNo", paymentNo);
        result.put("refundAmount", refundAmount);
        result.put("message", "退款成功");
        result.put("refundNo", "REF" + System.currentTimeMillis());
        
        return result;
    }
}
