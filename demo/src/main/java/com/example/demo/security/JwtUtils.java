package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

/**
 * JwtUtils 工具类，用于处理JWT（JSON Web Token）的生成、解析和验证。
 * @author FirstProject
 * @version 1.0
 */
@Component
public class JwtUtils {
    
    @Value("${jwt.secret:mySecretKeyForJwtTokenGenerationMustBeLongEnough123456}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration; // 默认24小时
    
    private Key key;
    
    /**
     * 初始化方法，在依赖注入完成后执行。
     * 用于将JWT密钥字符串转换为SecretKey对象。
     */
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    /**
     * 根据用户名和角色生成JWT令牌。
     * @param username 用户名
     * @param role 用户角色
     * @return 生成的JWT字符串
     */
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    /**
     * 从JWT令牌中获取用户名（Subject）。
     * @param token JWT令牌
     * @return 用户名
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    /**
     * 从JWT令牌中获取用户角色。
     * @param token JWT令牌
     * @return 用户角色
     */
    public String getRoleFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }
    
    /**
     * 验证JWT令牌的有效性。
     * @param token JWT令牌
     * @return 如果令牌有效则返回true，否则返回false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Log the exception for debugging
            // e.g., logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}
