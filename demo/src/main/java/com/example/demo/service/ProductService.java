package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.model.Category;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * ProductService 类提供商品相关的业务逻辑。
 * 包括商品的增删改查、库存和价格管理，并应用了缓存策略。
 * @author FirstProject
 * @version 1.0
 */
@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * 获取所有商品。
     * 结果会被缓存。
     * @return 商品列表
     */
    @Cacheable(value = "products", key = "'all'")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * 根据分类ID获取商品列表。
     * 结果会根据分类ID进行缓存。
     * @param categoryId 分类ID
     * @return 属于该分类的商品列表
     */
    @Cacheable(value = "products", key = "'category_' + #categoryId")
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    /**
     * 根据ID获取单个商品。
     * 结果会根据商品ID进行缓存。
     * @param id 商品ID
     * @return 一个包含商品的Optional
     */
    @Cacheable(value = "products", key = "#id")
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    /**
     * 创建一个新商品。
     * 操作成功后会清除所有'products'相关的缓存。
     * @param product 要创建的商品对象
     * @param categoryId 商品所属的分类ID
     * @return 已创建的商品
     * @throws RuntimeException 如果分类不存在
     */
    @CacheEvict(value = "products", allEntries = true)
    public Product createProduct(Product product, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("分类不存在: " + categoryId));
        product.setCategory(category);
        return productRepository.save(product);
    }

    /**
     * 更新指定ID的商品信息。
     * 操作成功后会清除该商品以及'all'列表的缓存。
     * @param id 商品ID
     * @param productDetails 包含更新信息的商品对象
     * @param categoryId 新的分类ID（可选）
     * @return 更新后的商品
     * @throws RuntimeException 如果商品或分类不存在
     */
    @Caching(evict = {
        @CacheEvict(value = "products", key = "#id"),
        @CacheEvict(value = "products", key = "'all'")
    })
    public Product updateProduct(Long id, Product productDetails, Long categoryId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在: " + id));
        
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("分类不存在: " + categoryId));
            product.setCategory(category);
        }
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setImageUrl(productDetails.getImageUrl());
        return productRepository.save(product);
    }

    /**
     * 删除指定ID的商品。
     * 操作成功后会清除所有'products'相关的缓存。
     * @param id 商品ID
     * @throws RuntimeException 如果商品不存在
     */
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("商品不存在: " + id);
        }
        productRepository.deleteById(id);
    }

    /**
     * 更新指定ID的商品库存。
     * @param id 商品ID
     * @param stock 新的库存数量
     * @return 更新后的商品
     * @throws RuntimeException 如果商品不存在
     */
    public Product updateStock(Long id, Integer stock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在: " + id));
        product.setStock(stock);
        return productRepository.save(product);
    }

    /**
     * 获取低于指定阈值的低库存商品列表。
     * @param threshold 库存阈值
     * @return 低库存商品列表
     */
    public List<Product> getLowStockProducts(Integer threshold) {
        return productRepository.findByStockLessThan(threshold);
    }

    /**
     * 更新指定ID商品的标准价格。
     * @param id 商品ID
     * @param price 新的标准价格
     * @return 更新后的商品
     * @throws RuntimeException 如果商品不存在
     */
    public Product updateStandardPrice(Long id, BigDecimal price) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在: " + id));
        product.setStandardPrice(price);
        return productRepository.save(product);
    }

    /**
     * 设置商品的促销价和促销状态。
     * @param id 商品ID
     * @param promotionPrice 促销价格
     * @param isOnPromotion 是否处于促销状态
     * @return 更新后的商品
     * @throws RuntimeException 如果商品不存在
     */
    public Product setPromotionPrice(Long id, BigDecimal promotionPrice, Boolean isOnPromotion) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("商品不存在: " + id));
        product.setPromotionPrice(promotionPrice);
        product.setIsOnPromotion(isOnPromotion);
        return productRepository.save(product);
    }

    /**
     * 获取所有正在促销的商品列表。
     * @return 促销商品列表
     */
    public List<Product> getPromotionProducts() {
        return productRepository.findByIsOnPromotionTrue();
    }
}
