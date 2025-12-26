package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * AuthController 类处理与用户认证相关的请求，包括登录、注册和获取当前用户信息。
 * @author FirstProject
 * @version 1.0
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "认证管理", description = "用户登录、注册、登出接口")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    /**
     * 处理用户登录请求。
     * @param request 包含用户名和密码的请求体
     * @return 如果认证成功，返回包含JWT令牌和用户信息的ResponseEntity；否则返回错误信息。
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "使用用户名和密码登录，返回JWT令牌")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        
        User user = userRepository.findByUsername(username)
                .orElse(null);
        
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body("用户名或密码错误");
        }
        
        if (!user.getEnabled()) {
            return ResponseEntity.badRequest().body("账户已被禁用");
        }
        
        // 更新最后登录时间
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name());
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("name", user.getName());
        userInfo.put("role", user.getRole().name());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userInfo);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 处理用户注册请求。
     * @param request 包含用户名、密码、姓名和电子邮件的请求体
     * @return 如果注册成功，返回成功信息；否则返回错误信息。
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "注册新用户账户")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String name = request.get("name");
        String email = request.get("email");
        
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("用户名已存在");
        }
        
        if (email != null && userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("邮箱已被使用");
        }
        
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setEmail(email);
        user.setRole(User.Role.USER);
        user.setEnabled(true);
        
        userRepository.save(user);
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "注册成功");
        return ResponseEntity.ok(result);
    }
    
    /**
     * 根据提供的JWT令牌获取当前登录用户的信息。
     * @param authHeader Authorization请求头，包含Bearer令牌
     * @return 如果令牌有效，返回当前用户的详细信息；否则返回错误信息。
     */
    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息", description = "根据JWT令牌获取当前登录用户信息")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("未提供有效的认证令牌");
        }
        
        String token = authHeader.substring(7);
        String username = jwtUtils.getUsernameFromToken(token);
        
        User user = userRepository.findByUsername(username)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body("用户不存在");
        }
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("name", user.getName());
        userInfo.put("email", user.getEmail() != null ? user.getEmail() : "");
        userInfo.put("phone", user.getPhone() != null ? user.getPhone() : "");
        userInfo.put("role", user.getRole().name());
        
        return ResponseEntity.ok(userInfo);
    }
}
