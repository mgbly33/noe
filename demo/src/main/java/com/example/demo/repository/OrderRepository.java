package com.example.demo.repository;

import com.example.demo.model.Order;
import com.example.demo.model.Order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * OrderRepository 是一个JPA仓库，用于处理订单（Order）的数据库操作。
 * @author FirstProject
 * @version 1.0
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * 根据订单号查找订单。
     * @param orderNo 订单号
     * @return 一个包含订单的Optional，如果找到的话
     */
    Optional<Order> findByOrderNo(String orderNo);

    /**
     * 根据订单状态查找订单列表。
     * @param status 订单状态
     * @return 匹配状态的订单列表
     */
    List<Order> findByStatus(OrderStatus status);

    /**
     * 根据买家姓名模糊查找订单列表。
     * @param buyerName 买家姓名的一部分
     * @return 匹配的订单列表
     */
    List<Order> findByBuyerNameContaining(String buyerName);

    /**
     * 根据买家电话精确查找订单列表。
     * @param buyerPhone 买家电话
     * @return 匹配的订单列表
     */
    List<Order> findByBuyerPhone(String buyerPhone);

    /**
     * 根据关键词模糊搜索订单。
     * 搜索范围包括订单号、买家姓名和买家电话。
     * @param keyword 搜索关键词
     * @return 匹配的订单列表
     */
    @Query("SELECT o FROM Order o WHERE o.orderNo LIKE %:keyword% OR o.buyerName LIKE %:keyword% OR o.buyerPhone LIKE %:keyword%")
    List<Order> search(@Param("keyword") String keyword);

    /**
     * 查找所有订单，并按创建时间降序排列。
     * @return 排序后的订单列表
     */
    List<Order> findAllByOrderByCreatedAtDesc();

    /**
     * 根据订单状态查找订单列表，并按创建时间降序排列。
     * @param status 订单状态
     * @return 匹配状态并排序后的订单列表
     */
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
}
