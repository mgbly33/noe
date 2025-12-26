package com.example.demo.repository;

import com.example.demo.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ProductRepository 是一个JPA仓库，用于处理商品（Product）的数据库操作。
 * @author FirstProject
 * @version 1.0
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * 根据分类ID查找商品列表。
     * @param categoryId 分类ID
     * @return 属于该分类的商品列表
     */
    List<Product> findByCategoryId(Long categoryId);

    /**
     * 查找所有正在促销的商品。
     * @return 正在促销的商品列表
     */
    List<Product> findByIsOnPromotionTrue();

    /**
     * 查找库存量低于指定阈值的商品。
     * @param threshold 库存阈值
     * @return 库存过低的商品列表
     */
    List<Product> findByStockLessThan(Integer threshold);
}
