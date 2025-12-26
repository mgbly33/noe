package com.example.demo.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Redis配置类。
 * 用于配置Redis连接、RedisTemplate以及缓存管理器，支持Java 8日期时间类型序列化。
 * @author FirstProject
 * @version 1.0
 */
@Configuration
@EnableCaching
public class RedisConfig {

        /**
         * 创建支持 Java 8 日期时间类型的 ObjectMapper。
         * 配置了JavaTimeModule、日期序列化格式、可见性以及默认类型信息，以便正确处理JSON序列化/反序列化。
         * @return 配置好的ObjectMapper实例
         */
        private ObjectMapper createObjectMapper() {
                ObjectMapper objectMapper = new ObjectMapper();

                // 注册 JavaTimeModule 以支持 Java 8 日期时间类型 (LocalDateTime, LocalDate 等)
                objectMapper.registerModule(new JavaTimeModule());

                // 禁用将日期写为时间戳，使用 ISO-8601 格式
                objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

                // 设置可见性，使得所有字段都可以序列化
                objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);

                // 启用默认类型信息，以便正确反序列化
                objectMapper.activateDefaultTyping(
                                LaissezFaireSubTypeValidator.instance,
                                ObjectMapper.DefaultTyping.NON_FINAL,
                                JsonTypeInfo.As.PROPERTY);

                return objectMapper;
        }

        /**
         * 配置RedisTemplate，用于直接与Redis进行交互。
         * 使用StringRedisSerializer处理键，使用GenericJackson2JsonRedisSerializer处理值。
         * @param connectionFactory Redis连接工厂
         * @return 配置好的RedisTemplate实例
         */
        @Bean
        public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
                RedisTemplate<String, Object> template = new RedisTemplate<>();
                template.setConnectionFactory(connectionFactory);

                // 使用 String 序列化器作为 key 的序列化方式
                template.setKeySerializer(new StringRedisSerializer());
                template.setHashKeySerializer(new StringRedisSerializer());

                // 使用支持 Java 8 时间的 JSON 序列化器
                GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(
                                createObjectMapper());
                template.setValueSerializer(jsonSerializer);
                template.setHashValueSerializer(jsonSerializer);

                template.afterPropertiesSet();
                return template;
        }

        /**
         * 配置缓存管理器，用于Spring Cache抽象。
         * 定义了不同缓存区域的默认过期时间，并使用JSON序列化存储值。
         * @param connectionFactory Redis连接工厂
         * @return 配置好的CacheManager实例
         */
        @Bean
        public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
                // 创建支持 Java 8 时间的 JSON 序列化器
                GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(
                                createObjectMapper());

                // 基础配置，使用 JSON 序列化
                RedisCacheConfiguration baseConfig = RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofMinutes(30)) // 默认缓存30分钟
                                .serializeKeysWith(RedisSerializationContext.SerializationPair
                                                .fromSerializer(new StringRedisSerializer()))
                                .serializeValuesWith(RedisSerializationContext.SerializationPair
                                                .fromSerializer(jsonSerializer))
                                .disableCachingNullValues();

                return RedisCacheManager.builder(connectionFactory)
                                .cacheDefaults(baseConfig)
                                .withCacheConfiguration("products",
                                                baseConfig.entryTtl(Duration.ofMinutes(10)))
                                .withCacheConfiguration("categories",
                                                baseConfig.entryTtl(Duration.ofHours(1)))
                                .withCacheConfiguration("reports",
                                                baseConfig.entryTtl(Duration.ofMinutes(5)))
                                .build();
        }
}
