package com.example.demo.repository;

import com.example.demo.model.User;
import com.example.demo.model.User.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository 是一个JPA仓库，用于处理用户（User）的数据库操作。
 * @author FirstProject
 * @version 1.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据用户名查找用户。
     * @param username 用户名
     * @return 一个包含用户的Optional，如果找到的话
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据邮箱查找用户。
     * @param email 邮箱地址
     * @return 一个包含用户的Optional，如果找到的话
     */
    Optional<User> findByEmail(String email);

    /**
     * 检查是否存在指定用户名的用户。
     * @param username 用户名
     * @return 如果存在则返回true，否则返回false
     */
    boolean existsByUsername(String username);

    /**
     * 检查是否存在指定邮箱的用户。
     * @param email 邮箱地址
     * @return 如果存在则返回true，否则返回false
     */
    boolean existsByEmail(String email);

    /**
     * 根据角色查找用户列表（分页）。
     * @param role 用户角色
     * @param pageable 分页信息
     * @return 用户的分页结果
     */
    Page<User> findByRole(Role role, Pageable pageable);

    /**
     * 根据启用状态查找用户列表（分页）。
     * @param enabled 启用状态
     * @param pageable 分页信息
     * @return 用户的分页结果
     */
    Page<User> findByEnabled(Boolean enabled, Pageable pageable);

    /**
     * 根据关键词模糊搜索用户（分页）。
     * 搜索范围包括用户名、姓名、邮箱和电话。
     * @param keyword 搜索关键词
     * @param pageable 分页信息
     * @return 用户的分页结果
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "u.username LIKE %:keyword% OR " +
           "u.name LIKE %:keyword% OR " +
           "u.email LIKE %:keyword% OR " +
           "u.phone LIKE %:keyword%)")
    Page<User> search(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 根据动态筛选条件（关键词、角色、启用状态）搜索用户（分页）。
     * @param keyword 搜索关键词 (可选)
     * @param role 用户角色 (可选)
     * @param enabled 启用状态 (可选)
     * @param pageable 分页信息
     * @return 经过筛选和分页的用户结果
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "u.username LIKE %:keyword% OR " +
           "u.name LIKE %:keyword% OR " +
           "u.email LIKE %:keyword% OR " +
           "u.phone LIKE %:keyword%) " +
           "AND (:role IS NULL OR u.role = :role) " +
           "AND (:enabled IS NULL OR u.enabled = :enabled)")
    Page<User> searchWithFilters(@Param("keyword") String keyword, 
                                  @Param("role") Role role,
                                  @Param("enabled") Boolean enabled,
                                  Pageable pageable);
}
