-- =========================================
-- 数据库重建脚本 - 解决中文乱码问题
-- 请在 MySQL 客户端中执行此脚本
-- =========================================

-- 1. 删除现有数据库
DROP DATABASE IF EXISTS ecommerce_db;

-- 2. 使用正确的字符集重新创建数据库
CREATE DATABASE ecommerce_db 
    CHARACTER SET utf8 
    COLLATE utf8_general_ci;

-- 3. 切换到新数据库
USE ecommerce_db;

-- 接下来重启 Spring Boot，JPA 会自动创建表结构，data.sql 会执行并插入数据
-- =========================================
