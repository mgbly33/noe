package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.model.User.Role;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * UserService 类提供用户管理相关的业务逻辑。
 * 包括用户的增删改查、角色和状态管理、密码重置等。
 * @author FirstProject
 * @version 1.0
 */
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 根据筛选条件获取用户列表（分页）。
     * @param keyword 搜索关键词（用户名、姓名、邮箱、电话），可选
     * @param role 用户角色 (可选)
     * @param enabled 用户是否启用 (可选)
     * @param page 页码
     * @param size 每页数量
     * @return 用户的分页结果
     */
    public Page<User> getUsers(String keyword, String role, Boolean enabled, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Role roleEnum = (role != null && !role.isEmpty()) ? Role.valueOf(role) : null;
        return userRepository.searchWithFilters(keyword, roleEnum, enabled, pageable);
    }

    /**
     * 根据ID获取单个用户。
     * @param id 用户ID
     * @return 一个包含用户的Optional
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * 根据用户名获取单个用户。
     * @param username 用户名
     * @return 一个包含用户的Optional
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * 创建一个新用户。
     * 在保存前会对密码进行加密。
     * @param user 要创建的用户对象
     * @return 已创建的用户
     * @throws RuntimeException 如果用户名或邮箱已存在
     */
    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("用户名已存在: " + user.getUsername());
        }
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("邮箱已被使用: " + user.getEmail());
        }
        // 密码加密
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * 更新指定ID的用户信息（不包括密码和角色）。
     * @param id 用户ID
     * @param userDetails 包含更新信息的用户对象
     * @return 更新后的用户
     * @throws RuntimeException 如果用户不存在或邮箱已被其他用户使用
     */
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        
        // 检查邮箱唯一性
        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("邮箱已被使用: " + userDetails.getEmail());
            }
        }
        
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setPhone(userDetails.getPhone());
        return userRepository.save(user);
    }

    /**
     * 更新指定ID用户的角色。
     * @param id 用户ID
     * @param role 新的角色
     * @return 更新后的用户
     * @throws RuntimeException 如果用户不存在
     */
    public User updateRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        user.setRole(role);
        return userRepository.save(user);
    }

    /**
     * 切换指定ID用户的启用/禁用状态。
     * @param id 用户ID
     * @return 更新后的用户
     * @throws RuntimeException 如果用户不存在
     */
    public User toggleEnabled(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        user.setEnabled(!user.getEnabled());
        return userRepository.save(user);
    }

    /**
     * 设置指定ID用户的启用状态。
     * @param id 用户ID
     * @param enabled 启用状态
     * @return 更新后的用户
     * @throws RuntimeException 如果用户不存在
     */
    public User setEnabled(Long id, Boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        user.setEnabled(enabled);
        return userRepository.save(user);
    }

    /**
     * 重置指定ID用户的密码。
     * 新密码在保存前会被加密。
     * @param id 用户ID
     * @param newPassword 新的明文密码
     * @return 更新后的用户
     * @throws RuntimeException 如果用户不存在
     */
    public User resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        // 密码加密
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    /**
     * 删除指定ID的用户。
     * @param id 用户ID
     * @throws RuntimeException 如果用户不存在
     */
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("用户不存在: " + id);
        }
        userRepository.deleteById(id);
    }
}
