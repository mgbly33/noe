package com.example.demo.service;

import com.example.demo.model.Category;
import com.example.demo.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * CategoryService 类提供商品分类相关的业务逻辑。
 * 包括分类的增删改查，并应用了缓存策略以提高性能。
 * @author FirstProject
 * @version 1.0
 */
@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * 获取所有商品分类。
     * 使用缓存'categories'来存储结果。
     * @return 商品分类列表
     */
    @Cacheable(value = "categories", key = "'all'")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    /**
     * 根据ID获取单个商品分类。
     * 使用缓存'categories'，并以ID作为键。
     * @param id 商品分类ID
     * @return 一个包含商品分类的Optional，如果找到的话
     */
    @Cacheable(value = "categories", key = "#id")
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    /**
     * 创建一个新的商品分类。
     * 操作成功后会清除'categories'缓存。
     * @param category 要创建的商品分类对象
     * @return 已创建的商品分类
     * @throws RuntimeException 如果分类名称已存在
     */
    @CacheEvict(value = "categories", allEntries = true)
    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("分类名称已存在: " + category.getName());
        }
        return categoryRepository.save(category);
    }

    /**
     * 更新指定ID的商品分类。
     * 操作成功后会清除'categories'缓存。
     * @param id 商品分类ID
     * @param categoryDetails 包含更新信息的商品分类对象
     * @return 更新后的商品分类
     * @throws RuntimeException 如果分类不存在或新名称已存在
     */
    @CacheEvict(value = "categories", allEntries = true)
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("分类不存在: " + id));
        
        if (!category.getName().equals(categoryDetails.getName()) 
                && categoryRepository.existsByName(categoryDetails.getName())) {
            throw new RuntimeException("分类名称已存在: " + categoryDetails.getName());
        }
        
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        return categoryRepository.save(category);
    }

    /**
     * 删除指定ID的商品分类。
     * 操作成功后会清除'categories'缓存。
     * @param id 商品分类ID
     * @throws RuntimeException 如果分类不存在
     */
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("分类不存在: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
