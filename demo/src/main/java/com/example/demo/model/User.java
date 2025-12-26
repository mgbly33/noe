package com.example.demo.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * User实体类，代表系统中的一个用户。
 * @author FirstProject
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户ID，主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户名，必须唯一，用于登录
     */
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    /**
     * 用户密码（数据库中存储的是加密后的哈希值）
     */
    @Column(nullable = false)
    private String password;

    /**
     * 用户真实姓名或昵称
     */
    @Column(nullable = false, length = 50)
    private String name;

    /**
     * 用户邮箱，必须唯一
     */
    @Column(unique = true, length = 100)
    private String email;

    /**
     * 用户手机号
     */
    @Column(length = 20)
    private String phone;

    /**
     * 用户角色 (USER: 普通用户, ADMIN: 管理员)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER;

    /**
     * 账户是否启用
     */
    @Column(nullable = false)
    private Boolean enabled = true;

    /**
     * 账户创建时间
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * 账户最后更新时间
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 最后登录时间
     */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 用户角色枚举
     */
    public enum Role {
        /**
         * 普通用户
         */
        USER("普通用户"),
        /**
         * 管理员
         */
        ADMIN("管理员");

        private final String displayName;

        Role(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
