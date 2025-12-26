package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.User.Role;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * UserController 类负责处理与用户管理相关的API请求。
 * 包括用户的增删改查、角色更新、状态管理等。
 * @author FirstProject
 * @version 1.0
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;

    /**
     * 获取用户列表，支持分页和按关键词、角色、状态筛选。
     * @param keyword 搜索关键词（用户名、姓名、邮箱、电话），可选
     * @param role 角色，可选
     * @param enabled 是否启用，可选
     * @param page 页码
     * @param size 每页数量
     * @return 用户的分页结果
     */
    @GetMapping
    public Page<User> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return userService.getUsers(keyword, role, enabled, page, size);
    }

    /**
     * 根据ID获取用户详情。
     * @param id 用户ID
     * @return 包含用户信息的ResponseEntity，如果未找到则返回404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 创建一个新用户。
     * @param user 要创建的用户对象
     * @return 包含已创建用户的ResponseEntity，如果创建失败则返回错误信息
     */
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User created = userService.createUser(user);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新指定ID的用户信息。
     * @param id 用户ID
     * @param user 包含更新信息的用户对象
     * @return 包含更新后用户的ResponseEntity，如果更新失败则返回错误信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updated = userService.updateUser(id, user);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 更新指定ID用户的角色。
     * @param id 用户ID
     * @param request 包含新角色的请求体
     * @return 包含更新后用户的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Role role = Role.valueOf(request.get("role"));
            User updated = userService.updateRole(id, role);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 切换指定ID用户的启用/禁用状态。
     * @param id 用户ID
     * @return 包含更新后用户的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/toggle-enabled")
    public ResponseEntity<?> toggleEnabled(@PathVariable Long id) {
        try {
            User updated = userService.toggleEnabled(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 设置指定ID用户的启用状态。
     * @param id 用户ID
     * @param request 包含启用状态的布尔值
     * @return 包含更新后用户的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/enabled")
    public ResponseEntity<?> setEnabled(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        try {
            User updated = userService.setEnabled(id, request.get("enabled"));
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 重置指定ID用户的密码。
     * @param id 用户ID
     * @param request 包含新密码的请求体
     * @return 包含更新后用户的ResponseEntity，如果操作失败则返回错误信息
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            User updated = userService.resetPassword(id, request.get("password"));
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 删除指定ID的用户。
     * @param id 用户ID
     * @return 表示操作成功的ResponseEntity，如果删除失败则返回错误信息
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 获取所有可用的用户角色。
     * @return 用户角色枚举数组
     */
    @GetMapping("/roles")
    public Role[] getRoles() {
        return Role.values();
    }
}
