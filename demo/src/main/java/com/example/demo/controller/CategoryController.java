package com.example.demo.controller;

import com.example.demo.model.Category;
import com.example.demo.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CategoryController 类负责处理与商品分类相关的API请求。
 * 包括分类的增删改查以及缓存管理。
 * @author FirstProject
 * @version 1.0
 */
@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    /**
     * 获取所有商品分类。
     * @return 商品分类列表
     */
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    /**
     * 根据ID获取单个商品分类的详细信息。
     * @param id 商品分类ID
     * @return 包含商品分类信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 创建一个新的商品分类。
     * @param category 要创建的商品分类对象
     * @return 包含已创建商品分类的ResponseEntity，如果创建失败则返回错误信息
     */
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            Category created = categoryService.createCategory(category);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新指定ID的商品分类信息。
     * @param id 商品分类ID
     * @param category 包含更新信息的商品分类对象
     * @return 包含更新后商品分类的ResponseEntity，如果更新失败则返回错误信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            Category updated = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 删除指定ID的商品分类。
     * @param id 商品分类ID
     * @return 表示操作成功的ResponseEntity，如果删除失败则返回错误信息
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 清除与分类和商品相关的缓存。
     * 这是一个管理接口，用于在数据发生变化时手动清除缓存。
     * @return 表示缓存已清除的成功响应
     */
    @PostMapping("/cache/clear")
    @CacheEvict(value = { "categories", "products" }, allEntries = true)
    public ResponseEntity<String> clearCache() {
        return ResponseEntity.ok("缓存已清除");
    }
}
