package com.example.demo.repository;

import com.example.demo.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * CategoryRepository 是一个JPA仓库，用于处理商品分类（Category）的数据库操作。
 * @author FirstProject
 * @version 1.0
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * 根据分类名称查找分类。
     * @param name 分类名称
     * @return 一个包含分类的Optional，如果找到的话
     */
    Optional<Category> findByName(String name);

    /**
     * 检查是否存在指定名称的分类。
     * @param name 分类名称
     * @return 如果存在则返回true，否则返回false
     */
    boolean existsByName(String name);
}
