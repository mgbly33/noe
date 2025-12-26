package com.example.demo.config;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 数据初始化器 - 确保管理员账户存在且密码正确加密
 */
@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 在应用程序启动时执行，用于初始化默认管理员账户。
     * 如果“admin”用户不存在，则创建它并设置默认密码。
     * 如果“admin”用户存在但密码未加密，则更新为加密密码。
     * @param args 命令行参数
     */
    @Override
    public void run(String... args) {
        // 检查是否存在 admin 用户，如果不存在则创建
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setName("系统管理员");
            admin.setEmail("admin@example.com");
            admin.setPhone("13800000000");
            admin.setRole(User.Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println(">>> 已创建默认管理员账户: admin / 123456");
        } else {
            // 如果存在但密码未加密，则更新密码
            userRepository.findByUsername("admin").ifPresent(admin -> {
                if (!admin.getPassword().startsWith("$2a$")) {
                    admin.setPassword(passwordEncoder.encode("123456"));
                    userRepository.save(admin);
                    System.out.println(">>> 已更新管理员密码为加密格式");
                }
            });
        }
    }
}
