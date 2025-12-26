package com.example.demo.service;

import com.example.demo.model.Order.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * ReportService 类提供生成各类统计报表的业务逻辑。
 * 使用 JdbcTemplate 进行复杂的数据库查询，并利用 Redis (如果可用) 进行缓存以提高性能。
 * @author FirstProject
 * @version 1.0
 */
@Service
public class ReportService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    private static final String CACHE_PREFIX = "report:";
    private static final long CACHE_TTL = 5; // 缓存5分钟

    /**
     * 通用的缓存处理方法。优先从Redis缓存中获取数据，如果缓存不存在或Redis不可用，
     * 则执行查询逻辑并将结果存入缓存。
     * @param key 缓存键
     * @param supplier 数据查询逻辑
     * @param <T> 返回数据的类型
     * @return 缓存中或查询得到的数据
     */
    @SuppressWarnings("unchecked")
    private <T> T getFromCacheOrQuery(String key, java.util.function.Supplier<T> supplier) {
        if (redisTemplate != null) {
            try {
                T cached = (T) redisTemplate.opsForValue().get(CACHE_PREFIX + key);
                if (cached != null) {
                    return cached;
                }
                T result = supplier.get();
                redisTemplate.opsForValue().set(CACHE_PREFIX + key, result, CACHE_TTL, TimeUnit.MINUTES);
                return result;
            } catch (Exception e) {
                // Redis不可用时直接查询
                return supplier.get();
            }
        }
        return supplier.get();
    }

    /**
     * 获取核心业务指标的销售总览。
     * @return 包含今日/本月/总销售额、订单数、用户数等信息的Map
     */
    public Map<String, Object> getSalesOverview() {
        return getFromCacheOrQuery("overview", () -> {
            Map<String, Object> result = new HashMap<>();

            // 今日销售额
            String todaySql = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURDATE() AND status NOT IN ('CANCELLED')";
            BigDecimal todaySales = jdbcTemplate.queryForObject(todaySql, BigDecimal.class);
            result.put("todaySales", todaySales);

            // 本月销售额
            String monthSql = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) AND status NOT IN ('CANCELLED')";
            BigDecimal monthSales = jdbcTemplate.queryForObject(monthSql, BigDecimal.class);
            result.put("monthSales", monthSales);

            // 总销售额
            String totalSql = "SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status NOT IN ('CANCELLED')";
            BigDecimal totalSales = jdbcTemplate.queryForObject(totalSql, BigDecimal.class);
            result.put("totalSales", totalSales);

            // 今日订单数
            String todayOrderSql = "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()";
            Long todayOrders = jdbcTemplate.queryForObject(todayOrderSql, Long.class);
            result.put("todayOrders", todayOrders);

            // 总订单数
            String totalOrderSql = "SELECT COUNT(*) FROM orders";
            Long totalOrders = jdbcTemplate.queryForObject(totalOrderSql, Long.class);
            result.put("totalOrders", totalOrders);

            // 待处理订单
            String pendingSql = "SELECT COUNT(*) FROM orders WHERE status IN ('PENDING_PAYMENT', 'PENDING_SHIPMENT')";
            Long pendingOrders = jdbcTemplate.queryForObject(pendingSql, Long.class);
            result.put("pendingOrders", pendingOrders);

            // 商品总数
            String productSql = "SELECT COUNT(*) FROM products";
            Long totalProducts = jdbcTemplate.queryForObject(productSql, Long.class);
            result.put("totalProducts", totalProducts);

            // 用户总数
            String userSql = "SELECT COUNT(*) FROM users";
            Long totalUsers = jdbcTemplate.queryForObject(userSql, Long.class);
            result.put("totalUsers", totalUsers);

            return result;
        });
    }

    /**
     * 获取销售趋势数据。
     * @param period 统计周期（"day", "month", "year"）
     * @param startDate 开始日期 (yyyy-MM-dd)
     * @param endDate 结束日期 (yyyy-MM-dd)
     * @return 按指定周期统计的销售额和订单数列表
     */
    public List<Map<String, Object>> getSalesTrend(String period, String startDate, String endDate) {
        String cacheKey = "trend:" + period + ":" + startDate + ":" + endDate;
        return getFromCacheOrQuery(cacheKey, () -> {
            String sql;
            String dateFormat;

            switch (period) {
                case "day":
                    dateFormat = "%Y-%m-%d";
                    sql = "SELECT DATE_FORMAT(created_at, '" + dateFormat + "') as date, " +
                            "COALESCE(SUM(total_amount), 0) as sales, COUNT(*) as orders " +
                            "FROM orders WHERE status NOT IN ('CANCELLED') " +
                            "AND created_at BETWEEN ? AND ? " +
                            "GROUP BY DATE_FORMAT(created_at, '" + dateFormat + "') ORDER BY date";
                    break;
                case "month":
                    dateFormat = "%Y-%m";
                    sql = "SELECT DATE_FORMAT(created_at, '" + dateFormat + "') as date, " +
                            "COALESCE(SUM(total_amount), 0) as sales, COUNT(*) as orders " +
                            "FROM orders WHERE status NOT IN ('CANCELLED') " +
                            "AND created_at BETWEEN ? AND ? " +
                            "GROUP BY DATE_FORMAT(created_at, '" + dateFormat + "') ORDER BY date";
                    break;
                default: // year
                    dateFormat = "%Y";
                    sql = "SELECT DATE_FORMAT(created_at, '" + dateFormat + "') as date, " +
                            "COALESCE(SUM(total_amount), 0) as sales, COUNT(*) as orders " +
                            "FROM orders WHERE status NOT IN ('CANCELLED') " +
                            "AND created_at BETWEEN ? AND ? " +
                            "GROUP BY DATE_FORMAT(created_at, '" + dateFormat + "') ORDER BY date";
            }

            return jdbcTemplate.queryForList(sql, startDate + " 00:00:00", endDate + " 23:59:59");
        });
    }

    /**
     * 获取热销商品排行。
     * @param limit 返回排行的数量
     * @param startDate 开始日期 (yyyy-MM-dd)
     * @param endDate 结束日期 (yyyy-MM-dd)
     * @return 包含商品ID、名称、总销量和总销售额的列表
     */
    public List<Map<String, Object>> getTopProducts(int limit, String startDate, String endDate) {
        String cacheKey = "topProducts:" + limit + ":" + startDate + ":" + endDate;
        return getFromCacheOrQuery(cacheKey, () -> {
            String sql = "SELECT oi.product_id, oi.product_name, " +
                    "SUM(oi.quantity) as total_quantity, " +
                    "SUM(oi.subtotal) as total_sales " +
                    "FROM order_items oi " +
                    "JOIN orders o ON oi.order_id = o.id " +
                    "WHERE o.status NOT IN ('CANCELLED') " +
                    "AND o.created_at BETWEEN ? AND ? " +
                    "GROUP BY oi.product_id, oi.product_name " +
                    "ORDER BY total_quantity DESC LIMIT ?";
            return jdbcTemplate.queryForList(sql, startDate + " 00:00:00", endDate + " 23:59:59", limit);
        });
    }

    /**
     * 获取订单状态分布统计。
     * @return 包含各状态的订单数和总金额的列表
     */
    public List<Map<String, Object>> getOrderStatusDistribution() {
        return getFromCacheOrQuery("orderStatus", () -> {
            String sql = "SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount FROM orders GROUP BY status";
            List<Map<String, Object>> result = jdbcTemplate.queryForList(sql);

            // 添加状态中文名
            Map<String, String> statusNames = new HashMap<>();
            statusNames.put("PENDING_PAYMENT", "待支付");
            statusNames.put("PENDING_SHIPMENT", "待发货");
            statusNames.put("SHIPPED", "已发货");
            statusNames.put("COMPLETED", "已完成");
            statusNames.put("CANCELLED", "已取消");

            for (Map<String, Object> item : result) {
                String status = (String) item.get("status");
                item.put("statusName", statusNames.getOrDefault(status, status));
            }
            return result;
        });
    }

    /**
     * 获取各商品分类的销售统计。
     * @param startDate 开始日期 (yyyy-MM-dd)
     * @param endDate 结束日期 (yyyy-MM-dd)
     * @return 包含各分类ID、名称、总销售额和总销量的列表
     */
    public List<Map<String, Object>> getCategorySales(String startDate, String endDate) {
        String cacheKey = "categorySales:" + startDate + ":" + endDate;
        return getFromCacheOrQuery(cacheKey, () -> {
            String sql = "SELECT c.id, c.name, " +
                    "COALESCE(SUM(oi.subtotal), 0) as total_sales, " +
                    "COALESCE(SUM(oi.quantity), 0) as total_quantity " +
                    "FROM categories c " +
                    "LEFT JOIN products p ON c.id = p.category_id " +
                    "LEFT JOIN order_items oi ON p.id = oi.product_id " +
                    "LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('CANCELLED') " +
                    "AND o.created_at BETWEEN ? AND ? " +
                    "GROUP BY c.id, c.name ORDER BY total_sales DESC";
            return jdbcTemplate.queryForList(sql, startDate + " 00:00:00", endDate + " 23:59:59");
        });
    }

    /**
     * 获取最近的订单列表（无缓存）。
     * @param limit 返回的订单数量
     * @return 最近订单的关键信息列表
     */
    public List<Map<String, Object>> getRecentOrders(int limit) {
        String sql = "SELECT id, order_no, buyer_name, total_amount, status, created_at " +
                "FROM orders ORDER BY created_at DESC LIMIT ?";
        return jdbcTemplate.queryForList(sql, limit);
    }

    /**
     * 获取低库存商品列表（无缓存）。
     * @param threshold 库存阈值
     * @return 低于阈值的商品列表
     */
    public List<Map<String, Object>> getLowStockProducts(int threshold) {
        String sql = "SELECT p.id, p.name, p.stock, c.name as category_name " +
                "FROM products p LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.stock < ? ORDER BY p.stock ASC";
        return jdbcTemplate.queryForList(sql, threshold);
    }

    /**
     * 获取用户增长趋势。
     * @param period 统计周期（"day", "month", "year"）
     * @param startDate 开始日期 (yyyy-MM-dd)
     * @param endDate 结束日期 (yyyy-MM-dd)
     * @return 按指定周期统计的新增用户数列表
     */
    public List<Map<String, Object>> getUserGrowth(String period, String startDate, String endDate) {
        String cacheKey = "userGrowth:" + period + ":" + startDate + ":" + endDate;
        return getFromCacheOrQuery(cacheKey, () -> {
            String dateFormat = period.equals("day") ? "%Y-%m-%d" : (period.equals("month") ? "%Y-%m" : "%Y");
            String sql = "SELECT DATE_FORMAT(created_at, '" + dateFormat + "') as date, COUNT(*) as count " +
                    "FROM users WHERE created_at BETWEEN ? AND ? " +
                    "GROUP BY DATE_FORMAT(created_at, '" + dateFormat + "') ORDER BY date";
            return jdbcTemplate.queryForList(sql, startDate + " 00:00:00", endDate + " 23:59:59");
        });
    }

    /**
     * 清除所有报表相关的缓存。
     */
    public void clearCache() {
        if (redisTemplate != null) {
            try {
                Set<String> keys = redisTemplate.keys(CACHE_PREFIX + "*");
                if (keys != null && !keys.isEmpty()) {
                    redisTemplate.delete(keys);
                }
            } catch (Exception e) {
                // 忽略Redis错误
            }
        }
    }
}
