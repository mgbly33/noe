package com.example.demo.controller;

import com.example.demo.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * ReportController 类负责提供各类统计报表API。
 * 包括销售总览、趋势分析、热门商品、用户增长等。
 * @author FirstProject
 * @version 1.0
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * 获取销售总览数据，包括总销售额、总订单数等核心指标。
     * @return 包含销售总览信息的Map
     */
    @GetMapping("/overview")
    public Map<String, Object> getSalesOverview() {
        return reportService.getSalesOverview();
    }

    /**
     * 获取销售摘要信息，是 getSalesOverview 的别名。
     * @return 包含销售总览信息的Map
     */
    @GetMapping("/sales-summary")
    public Map<String, Object> getSalesSummary() {
        return reportService.getSalesOverview();
    }

    /**
     * 获取销售趋势数据。
     * @param period 时间周期（day, month, year）
     * @param startDate 开始日期 (yyyy-MM-dd)，可选
     * @param endDate 结束日期 (yyyy-MM-dd)，可选
     * @return 按时间周期分组的销售数据列表
     */
    @GetMapping("/sales-trend")
    public List<Map<String, Object>> getSalesTrend(
            @RequestParam(defaultValue = "day") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        if (startDate == null || endDate == null) {
            LocalDate now = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            switch (period) {
                case "day":
                    startDate = now.minusDays(30).format(formatter);
                    endDate = now.format(formatter);
                    break;
                case "month":
                    startDate = now.minusMonths(12).format(formatter);
                    endDate = now.format(formatter);
                    break;
                default:
                    startDate = now.minusYears(5).format(formatter);
                    endDate = now.format(formatter);
            }
        }
        return reportService.getSalesTrend(period, startDate, endDate);
    }

    /**
     * 获取热门销售商品列表。
     * @param limit 返回的商品数量
     * @param startDate 开始日期 (yyyy-MM-dd)，可选
     * @param endDate 结束日期 (yyyy-MM-dd)，可选
     * @return 热门商品信息列表
     */
    @GetMapping("/top-products")
    public List<Map<String, Object>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        if (startDate == null || endDate == null) {
            LocalDate now = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            startDate = now.minusDays(30).format(formatter);
            endDate = now.format(formatter);
        }
        return reportService.getTopProducts(limit, startDate, endDate);
    }

    /**
     * 获取订单状态分布情况。
     * @return 包含各类状态订单数量的列表
     */
    @GetMapping("/order-status")
    public List<Map<String, Object>> getOrderStatusDistribution() {
        return reportService.getOrderStatusDistribution();
    }

    /**
     * 获取各商品分类的销售情况。
     * @param startDate 开始日期 (yyyy-MM-dd)，可选
     * @param endDate 结束日期 (yyyy-MM-dd)，可选
     * @return 各分类销售数据列表
     */
    @GetMapping("/category-sales")
    public List<Map<String, Object>> getCategorySales(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        if (startDate == null || endDate == null) {
            LocalDate now = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            startDate = now.minusDays(30).format(formatter);
            endDate = now.format(formatter);
        }
        return reportService.getCategorySales(startDate, endDate);
    }

    /**
     * 获取最近的订单列表。
     * @param limit 返回的订单数量
     * @return 最近订单信息列表
     */
    @GetMapping("/recent-orders")
    public List<Map<String, Object>> getRecentOrders(@RequestParam(defaultValue = "10") int limit) {
        return reportService.getRecentOrders(limit);
    }

    /**
     * 获取低库存商品列表。
     * @param threshold 库存阈值
     * @return 低于阈值的商品列表
     */
    @GetMapping("/low-stock")
    public List<Map<String, Object>> getLowStockProducts(@RequestParam(defaultValue = "10") int threshold) {
        return reportService.getLowStockProducts(threshold);
    }

    /**
     * 获取用户增长趋势。
     * @param period 时间周期（day, month, year）
     * @param startDate 开始日期 (yyyy-MM-dd)，可选
     * @param endDate 结束日期 (yyyy-MM-dd)，可选
     * @return 按时间周期分组的用户增长数据列表
     */
    @GetMapping("/user-growth")
    public List<Map<String, Object>> getUserGrowth(
            @RequestParam(defaultValue = "day") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        if (startDate == null || endDate == null) {
            LocalDate now = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            startDate = now.minusDays(30).format(formatter);
            endDate = now.format(formatter);
        }
        return reportService.getUserGrowth(period, startDate, endDate);
    }

    /**
     * 清除报表相关的缓存。
     * @return 表示操作成功的ResponseEntity
     */
    @PostMapping("/clear-cache")
    public ResponseEntity<?> clearCache() {
        reportService.clearCache();
        return ResponseEntity.ok(Collections.singletonMap("message", "缓存已清除"));
    }
}
