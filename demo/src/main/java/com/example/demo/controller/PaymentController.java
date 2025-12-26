package com.example.demo.controller;

import com.example.demo.model.Payment;
import com.example.demo.model.Payment.PaymentMethod;
import com.example.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PaymentController 类负责处理与支付相关的API请求。
 * 包括创建支付、执行支付、查询状态、退款等。
 * @author FirstProject
 * @version 1.0
 */
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;

    /**
     * 获取所有支付记录。
     * @return 支付记录列表
     */
    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    /**
     * 根据ID获取支付记录详情。
     * @param id 支付ID
     * @return 包含支付信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 根据支付号获取支付记录详情。
     * @param paymentNo 支付号
     * @return 包含支付信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/no/{paymentNo}")
    public ResponseEntity<?> getPaymentByNo(@PathVariable String paymentNo) {
        return paymentService.getPaymentByPaymentNo(paymentNo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 根据订单ID获取相关的所有支付记录。
     * @param orderId 订单ID
     * @return 该订单的支付记录列表
     */
    @GetMapping("/order/{orderId}")
    public List<Payment> getPaymentsByOrderId(@PathVariable Long orderId) {
        return paymentService.getPaymentsByOrderId(orderId);
    }

    /**
     * 为指定订单创建一笔支付。
     * @param request 包含订单ID和支付方式的请求体
     * @return 包含已创建支付记录的ResponseEntity，如果创建失败则返回错误信息
     */
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            PaymentMethod method = PaymentMethod.valueOf((String) request.get("paymentMethod"));
            Payment payment = paymentService.createPayment(orderId, method);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * 执行一笔支付（模拟）。
     * @param paymentNo 支付号
     * @return 包含支付结果的ResponseEntity，如果操作失败则返回错误信息
     */
    @PostMapping("/execute/{paymentNo}")
    public ResponseEntity<?> executePayment(@PathVariable String paymentNo) {
        try {
            Map<String, Object> result = paymentService.executePayment(paymentNo);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * 创建并立即执行支付。
     * @param request 包含订单ID和支付方式的请求体
     * @return 包含支付结果的ResponseEntity，如果操作失败则返回错误信息
     */
    @PostMapping("/pay")
    public ResponseEntity<?> pay(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            PaymentMethod method = PaymentMethod.valueOf((String) request.get("paymentMethod"));
            Payment payment = paymentService.createPayment(orderId, method);
            Map<String, Object> result = paymentService.executePayment(payment.getPaymentNo());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 查询指定支付号的支付状态。
     * @param paymentNo 支付号
     * @return 包含支付状态的ResponseEntity，如果查询失败则返回错误信息
     */
    @GetMapping("/status/{paymentNo}")
    public ResponseEntity<?> queryStatus(@PathVariable String paymentNo) {
        try {
            Map<String, Object> result = paymentService.queryPaymentStatus(paymentNo);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * 取消一笔支付。
     * @param paymentNo 支付号
     * @return 包含更新后支付记录的ResponseEntity，如果操作失败则返回错误信息
     */
    @PostMapping("/cancel/{paymentNo}")
    public ResponseEntity<?> cancelPayment(@PathVariable String paymentNo) {
        try {
            Payment payment = paymentService.cancelPayment(paymentNo);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * 为一笔已支付的订单进行退款。
     * @param paymentNo 支付号
     * @param request 包含退款金额（可选）的请求体
     * @return 包含退款结果的ResponseEntity，如果操作失败则返回错误信息
     */
    @PostMapping("/refund/{paymentNo}")
    public ResponseEntity<?> refundPayment(@PathVariable String paymentNo, 
                                           @RequestBody(required = false) Map<String, Object> request) {
        try {
            BigDecimal refundAmount = null;
            if (request != null && request.get("amount") != null) {
                refundAmount = new BigDecimal(request.get("amount").toString());
            }
            Map<String, Object> result = paymentService.refundPayment(paymentNo, refundAmount);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * 获取所有可用的支付方式。
     * @return 支付方式枚举数组
     */
    @GetMapping("/methods")
    public PaymentMethod[] getPaymentMethods() {
        return PaymentMethod.values();
    }
}
