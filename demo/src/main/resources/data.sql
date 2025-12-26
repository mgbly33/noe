-- 初始化测试数据
-- 使用 INSERT IGNORE 避免重复插入时报错

-- 插入分类数据
INSERT IGNORE INTO categories (id, name, description, created_at, updated_at) VALUES
(1, '电子产品', '手机、电脑、数码配件等', NOW(), NOW()),
(2, '服装鞋帽', '男装、女装、鞋子、帽子等', NOW(), NOW()),
(3, '食品饮料', '零食、饮料、生鲜等', NOW(), NOW()),
(4, '家居用品', '家具、家纺、厨具等', NOW(), NOW()),
(5, '图书文具', '书籍、办公用品、文具等', NOW(), NOW());

-- 插入商品数据
INSERT IGNORE INTO products (id, name, description, standard_price, promotion_price, is_on_promotion, stock, category_id, created_at, updated_at) VALUES
(1, 'iPhone 15 Pro', '苹果最新旗舰手机，A17芯片', 8999.00, 8499.00, 1, 100, 1, NOW(), NOW()),
(2, 'MacBook Pro 14', '专业级笔记本电脑，M3芯片', 14999.00, NULL, 0, 50, 1, NOW(), NOW()),
(3, 'AirPods Pro 2', '主动降噪无线耳机', 1899.00, 1699.00, 1, 200, 1, NOW(), NOW()),
(4, '男士休闲夹克', '春秋季薄款外套', 299.00, 199.00, 1, 150, 2, NOW(), NOW()),
(5, '女士连衣裙', '夏季碎花连衣裙', 199.00, NULL, 0, 80, 2, NOW(), NOW()),
(6, '运动跑鞋', '透气轻便跑步鞋', 399.00, 299.00, 1, 120, 2, NOW(), NOW()),
(7, '进口牛奶', '澳洲进口全脂牛奶1L*12', 89.00, 79.00, 1, 500, 3, NOW(), NOW()),
(8, '坚果礼盒', '混合坚果大礼包', 128.00, NULL, 0, 300, 3, NOW(), NOW()),
(9, '实木书桌', '北欧风格简约书桌', 899.00, 799.00, 1, 30, 4, NOW(), NOW()),
(10, '四件套床品', '纯棉床上用品套装', 299.00, NULL, 0, 100, 4, NOW(), NOW()),
(11, '编程入门书籍', 'Java从入门到精通', 69.00, 49.00, 1, 200, 5, NOW(), NOW()),
(12, '办公文具套装', '笔记本+签字笔+文件夹', 39.00, NULL, 0, 500, 5, NOW(), NOW());

-- 插入用户数据由 DataInitializer 自动创建，确保密码正确加密
-- 默认管理员账户: admin / 123456

-- 插入订单数据
INSERT IGNORE INTO orders (id, order_no, status, total_amount, buyer_name, buyer_phone, buyer_address, created_at, updated_at, paid_at) VALUES
(1, 'ORD20241226001', 'COMPLETED', 8499.00, '张三', '13800000001', '北京市朝阳区xxx街道xxx号', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW(), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'ORD20241226002', 'SHIPPED', 1699.00, '李四', '13800000002', '上海市浦东新区xxx路xxx号', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'ORD20241226003', 'PENDING_SHIPMENT', 498.00, '王五', '13800000003', '广州市天河区xxx大道xxx号', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 'ORD20241226004', 'PENDING_PAYMENT', 899.00, '张三', '13800000001', '北京市海淀区xxx路xxx号', NOW(), NOW(), NULL),
(5, 'ORD20241226005', 'COMPLETED', 299.00, '李四', '13800000002', '上海市静安区xxx街xxx号', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW(), DATE_SUB(NOW(), INTERVAL 7 DAY));

-- 插入订单商品数据
INSERT IGNORE INTO order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES
(1, 1, 1, 'iPhone 15 Pro', 8499.00, 1, 8499.00),
(2, 2, 3, 'AirPods Pro 2', 1699.00, 1, 1699.00),
(3, 3, 4, '男士休闲夹克', 199.00, 1, 199.00),
(4, 3, 6, '运动跑鞋', 299.00, 1, 299.00),
(5, 4, 9, '实木书桌', 799.00, 1, 799.00),
(6, 4, 12, '办公文具套装', 39.00, 1, 39.00),
(7, 5, 6, '运动跑鞋', 299.00, 1, 299.00);

-- 插入优惠券数据
INSERT IGNORE INTO coupons (id, name, code, type, value, min_amount, max_discount, total_count, used_count, per_limit, start_time, end_time, enabled, description, created_at, updated_at) VALUES
(1, '新用户满减券', 'NEW100', 'FIXED', 100.00, 500.00, NULL, 1000, 50, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, '新用户专享，满500减100', NOW(), NOW()),
(2, '全场9折券', 'SALE90', 'PERCENT', 90.00, 200.00, 100.00, 500, 20, 1, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 1, '全场商品9折，最高优惠100元', NOW(), NOW()),
(3, '电子产品满减', 'DIGI50', 'FIXED', 50.00, 300.00, NULL, NULL, 0, 3, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 1, '电子产品满300减50', NOW(), NOW());

-- 插入折扣活动数据
INSERT IGNORE INTO discounts (id, name, type, value, scope, category_id, product_ids, start_time, end_time, enabled, description, created_at, updated_at) VALUES
(1, '全场85折', 'PERCENT', 85.00, 'ALL', NULL, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, '年终大促，全场85折', NOW(), NOW()),
(2, '服装类8折', 'PERCENT', 80.00, 'CATEGORY', 2, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, '服装鞋帽全场8折', NOW(), NOW()),
(3, '指定商品立减', 'FIXED', 200.00, 'PRODUCT', NULL, '1,2', NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 'iPhone和MacBook立减200', NOW(), NOW());

-- 插入评价数据
INSERT IGNORE INTO reviews (id, product_id, product_name, order_id, user_id, user_name, rating, content, is_anonymous, status, admin_reply, reply_at, created_at, updated_at) VALUES
(1, 1, 'iPhone 15 Pro', 1, 2, '张三', 5, '手机非常好用，拍照效果很棒，运行流畅！', 0, 'APPROVED', '感谢您的好评，欢迎再次光临！', NOW(), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(2, 3, 'AirPods Pro 2', 2, 3, '李四', 4, '降噪效果不错，音质也很好，就是价格有点贵。', 0, 'APPROVED', NULL, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(3, 4, '男士休闲夹克', 3, 4, '王五', 5, '衣服质量很好，穿着舒适，物流也很快！', 0, 'PENDING', NULL, NULL, NOW(), NOW()),
(4, 6, '运动跑鞋', 5, 3, NULL, 4, '鞋子很轻便，跑步很舒服。', 1, 'APPROVED', NULL, NULL, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW());

-- 插入支付记录数据
INSERT IGNORE INTO payments (id, payment_no, order_id, order_no, payment_method, amount, status, transaction_id, created_at, paid_at) VALUES
(1, 'PAY20241221001', 1, 'ORD20241226001', 'ALIPAY', 8499.00, 'SUCCESS', 'ALI1703145600001', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'PAY20241223001', 2, 'ORD20241226002', 'WECHAT', 1699.00, 'SUCCESS', 'WX1703318400001', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'PAY20241225001', 3, 'ORD20241226003', 'ALIPAY', 498.00, 'SUCCESS', 'ALI1703491200001', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 'PAY20241219001', 5, 'ORD20241226005', 'UNIONPAY', 299.00, 'SUCCESS', 'UP1702972800001', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));
