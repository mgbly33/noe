package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * ProductController 类负责处理所有与商品相关的API请求。
 * 包括商品的增删改查、库存管理和价格管理。
 * @author FirstProject
 * @version 1.0
 */
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@Tag(name = "商品管理", description = "商品的增删改查、库存管理、价格管理接口")
public class ProductController {
    
    @Autowired
    private ProductService productService;

    /**
     * 获取所有商品或根据分类ID筛选商品。
     * @param categoryId 可选的分类ID
     * @return 商品列表
     */
    @GetMapping
    @Operation(summary = "获取商品列表", description = "获取所有商品或按分类筛选")
    public List<Product> getAllProducts(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return productService.getProductsByCategory(categoryId);
        }
        return productService.getAllProducts();
    }

    /**
     * 根据商品ID获取商品详情。
     * @param id 商品ID
     * @return 包含商品信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取商品详情", description = "根据ID获取商品详细信息")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 创建一个新商品。
     * @param request 包含商品信息的请求体
     * @return 包含创建的商品的ResponseEntity，如果创建失败则返回错误信息
     */
    @PostMapping
    @Operation(summary = "创建商品", description = "添加新商品")
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> request) {
        try {
            Product product = new Product();
            product.setName((String) request.get("name"));
            product.setDescription((String) request.get("description"));
            product.setStandardPrice(new BigDecimal(request.get("standardPrice").toString()));
            product.setStock((Integer) request.get("stock"));
            product.setImageUrl((String) request.get("imageUrl"));
            
            if (request.get("promotionPrice") != null) {
                product.setPromotionPrice(new BigDecimal(request.get("promotionPrice").toString()));
            }
            if (request.get("isOnPromotion") != null) {
                product.setIsOnPromotion((Boolean) request.get("isOnPromotion"));
            }
            
            Long categoryId = Long.valueOf(request.get("categoryId").toString());
            Product created = productService.createProduct(product, categoryId);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新指定ID的商品信息。
     * @param id 商品ID
     * @param request 包含要更新的商品信息的请求体
     * @return 包含更新后的商品的ResponseEntity，如果更新失败则返回错误信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Product product = new Product();
            product.setName((String) request.get("name"));
            product.setDescription((String) request.get("description"));
            product.setImageUrl((String) request.get("imageUrl"));
            
            Long categoryId = request.get("categoryId") != null 
                    ? Long.valueOf(request.get("categoryId").toString()) : null;
            Product updated = productService.updateProduct(id, product, categoryId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 删除指定ID的商品。
     * @param id 商品ID
     * @return 表示操作成功的ResponseEntity，如果删除失败则返回错误信息
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * 更新指定ID的商品库存。
     * @param id 商品ID
     * @param request 包含新库存数量的请求体
     * @return 包含更新后商品的ResponseEntity，如果更新失败则返回错误信息
     */
    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Product updated = productService.updateStock(id, request.get("stock"));
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取低于指定阈值的低库存商品列表。
     * @param threshold 库存阈值
     * @return 低库存商品列表
     */
    @GetMapping("/low-stock")
    public List<Product> getLowStockProducts(@RequestParam(defaultValue = "10") Integer threshold) {
        return productService.getLowStockProducts(threshold);
    }

    /**
     * 更新指定ID的商品价格。
     * @param id 商品ID
     * @param request 包含标准价格和/或促销价格的请求体
     * @return 包含更新后商品的ResponseEntity，如果更新失败则返回错误信息
     */
    @PutMapping("/{id}/price")
    public ResponseEntity<?> updatePrice(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            BigDecimal standardPrice = request.get("standardPrice") != null 
                    ? new BigDecimal(request.get("standardPrice").toString()) : null;
            BigDecimal promotionPrice = request.get("promotionPrice") != null 
                    ? new BigDecimal(request.get("promotionPrice").toString()) : null;
            Boolean isOnPromotion = (Boolean) request.get("isOnPromotion");
            
            Product product = productService.getProductById(id)
                    .orElseThrow(() -> new RuntimeException("商品不存在"));
            
            if (standardPrice != null) {
                product = productService.updateStandardPrice(id, standardPrice);
            }
            if (promotionPrice != null || isOnPromotion != null) {
                product = productService.setPromotionPrice(id, promotionPrice, isOnPromotion);
            }
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取所有正在促销的商品列表。
     * @return 促销商品列表
     */
    @GetMapping("/promotions")
    public List<Product> getPromotionProducts() {
        return productService.getPromotionProducts();
    }
}
