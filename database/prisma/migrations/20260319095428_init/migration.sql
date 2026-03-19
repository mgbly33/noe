-- CreateTable
CREATE TABLE `t_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(64) NOT NULL,
    `login_type` VARCHAR(32) NULL,
    `login_name` VARCHAR(64) NULL,
    `password_hash` VARCHAR(255) NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'guest',
    `device_id` VARCHAR(128) NULL,
    `channel` VARCHAR(32) NOT NULL,
    `openid` VARCHAR(128) NULL,
    `unionid` VARCHAR(128) NULL,
    `mobile_masked` VARCHAR(32) NULL,
    `nickname` VARCHAR(64) NULL,
    `avatar_url` VARCHAR(512) NULL,
    `register_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(32) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `t_user_user_id_key`(`user_id`),
    UNIQUE INDEX `t_user_login_name_key`(`login_name`),
    UNIQUE INDEX `t_user_openid_key`(`openid`),
    INDEX `t_user_unionid_idx`(`unionid`),
    INDEX `t_user_openid_idx`(`openid`),
    INDEX `t_user_login_name_idx`(`login_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_consent_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `consent_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `consent_type` VARCHAR(32) NOT NULL,
    `version` VARCHAR(32) NOT NULL,
    `accepted` BOOLEAN NOT NULL DEFAULT false,
    `channel` VARCHAR(32) NOT NULL,
    `client_ip` VARCHAR(64) NULL,
    `device_id` VARCHAR(128) NULL,
    `accepted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_consent_record_consent_id_key`(`consent_id`),
    INDEX `t_consent_record_user_id_consent_type_version_idx`(`user_id`, `consent_type`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_question_session` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `session_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `topic_type` VARCHAR(32) NOT NULL,
    `question_text` VARCHAR(2000) NOT NULL,
    `question_hash` VARCHAR(128) NOT NULL,
    `risk_level` VARCHAR(16) NOT NULL,
    `risk_tags` JSON NULL,
    `entry_channel` VARCHAR(32) NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'created',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_question_session_session_id_key`(`session_id`),
    INDEX `t_question_session_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `t_question_session_question_hash_idx`(`question_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_product_sku` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `sku_id` VARCHAR(64) NOT NULL,
    `sku_type` VARCHAR(32) NOT NULL,
    `reading_type` VARCHAR(32) NOT NULL,
    `title` VARCHAR(128) NOT NULL,
    `sub_title` VARCHAR(256) NULL,
    `price_amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(16) NOT NULL DEFAULT 'CNY',
    `credit_count` INTEGER NOT NULL DEFAULT 1,
    `validity_days` INTEGER NOT NULL DEFAULT 30,
    `status` VARCHAR(32) NOT NULL DEFAULT 'active',
    `channel_scope` VARCHAR(64) NULL,
    `sort_no` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_product_sku_sku_id_key`(`sku_id`),
    INDEX `t_product_sku_status_sort_no_idx`(`status`, `sort_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_order` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `session_id` VARCHAR(64) NOT NULL,
    `sku_id` VARCHAR(64) NOT NULL,
    `biz_type` VARCHAR(32) NOT NULL DEFAULT 'reading_purchase',
    `amount` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `payable_amount` DECIMAL(10, 2) NOT NULL,
    `pay_status` VARCHAR(32) NOT NULL,
    `order_status` VARCHAR(32) NOT NULL,
    `source` VARCHAR(64) NULL,
    `expired_at` DATETIME(3) NULL,
    `paid_at` DATETIME(3) NULL,
    `closed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_order_order_id_key`(`order_id`),
    INDEX `t_order_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `t_order_pay_status_created_at_idx`(`pay_status`, `created_at`),
    INDEX `t_order_session_id_idx`(`session_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_payment_transaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(64) NOT NULL,
    `order_id` VARCHAR(64) NOT NULL,
    `pay_channel` VARCHAR(32) NOT NULL,
    `third_party_trade_no` VARCHAR(128) NULL,
    `prepay_id` VARCHAR(128) NULL,
    `callback_payload` JSON NULL,
    `pay_status` VARCHAR(32) NOT NULL,
    `paid_amount` DECIMAL(10, 2) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_payment_transaction_transaction_id_key`(`transaction_id`),
    UNIQUE INDEX `t_payment_transaction_third_party_trade_no_key`(`third_party_trade_no`),
    INDEX `t_payment_transaction_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_entitlement_asset` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `asset_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `source_order_id` VARCHAR(64) NOT NULL,
    `asset_type` VARCHAR(32) NOT NULL DEFAULT 'reading_credit',
    `total_count` INTEGER NOT NULL,
    `available_count` INTEGER NOT NULL,
    `locked_count` INTEGER NOT NULL DEFAULT 0,
    `consumed_count` INTEGER NOT NULL DEFAULT 0,
    `expired_at` DATETIME(3) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'available',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_entitlement_asset_asset_id_key`(`asset_id`),
    INDEX `t_entitlement_asset_user_id_status_expired_at_idx`(`user_id`, `status`, `expired_at`),
    INDEX `t_entitlement_asset_source_order_id_idx`(`source_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_entitlement_consume_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `log_id` VARCHAR(64) NOT NULL,
    `asset_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `reading_id` VARCHAR(64) NULL,
    `action_type` VARCHAR(32) NOT NULL,
    `change_count` INTEGER NOT NULL,
    `before_count` INTEGER NOT NULL,
    `after_count` INTEGER NOT NULL,
    `remark` VARCHAR(256) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `t_entitlement_consume_log_log_id_key`(`log_id`),
    INDEX `t_entitlement_consume_log_asset_id_created_at_idx`(`asset_id`, `created_at`),
    INDEX `t_entitlement_consume_log_reading_id_idx`(`reading_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_reading` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `reading_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NOT NULL,
    `session_id` VARCHAR(64) NOT NULL,
    `spread_type` VARCHAR(32) NOT NULL,
    `question_text` VARCHAR(2000) NOT NULL,
    `reading_status` VARCHAR(32) NOT NULL,
    `risk_level` VARCHAR(16) NOT NULL,
    `source_order_id` VARCHAR(64) NULL,
    `source_asset_id` VARCHAR(64) NULL,
    `style_code` VARCHAR(32) NULL,
    `disclaimer_version` VARCHAR(32) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_reading_reading_id_key`(`reading_id`),
    INDEX `t_reading_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `t_reading_session_id_idx`(`session_id`),
    INDEX `t_reading_source_order_id_idx`(`source_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_draw_result` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `draw_id` VARCHAR(64) NOT NULL,
    `reading_id` VARCHAR(64) NOT NULL,
    `deck_version` VARCHAR(32) NOT NULL,
    `spread_type` VARCHAR(32) NOT NULL,
    `cards_json` JSON NOT NULL,
    `reversed_enabled` BOOLEAN NOT NULL DEFAULT false,
    `random_signature` VARCHAR(256) NULL,
    `redraw_count` INTEGER NOT NULL DEFAULT 0,
    `drawn_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_draw_result_draw_id_key`(`draw_id`),
    UNIQUE INDEX `t_draw_result_reading_id_key`(`reading_id`),
    INDEX `t_draw_result_drawn_at_idx`(`drawn_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_interpretation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `interpretation_id` VARCHAR(64) NOT NULL,
    `reading_id` VARCHAR(64) NOT NULL,
    `structured_json` JSON NOT NULL,
    `final_text` MEDIUMTEXT NULL,
    `model_vendor` VARCHAR(64) NULL,
    `model_version` VARCHAR(64) NULL,
    `prompt_version` VARCHAR(64) NULL,
    `policy_version` VARCHAR(64) NULL,
    `safety_result` VARCHAR(32) NULL,
    `latency_ms` INTEGER NULL,
    `token_input` INTEGER NULL,
    `token_output` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_interpretation_interpretation_id_key`(`interpretation_id`),
    UNIQUE INDEX `t_interpretation_reading_id_key`(`reading_id`),
    INDEX `t_interpretation_model_vendor_model_version_idx`(`model_vendor`, `model_version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_followup_message` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `message_id` VARCHAR(64) NOT NULL,
    `reading_id` VARCHAR(64) NOT NULL,
    `role` VARCHAR(16) NOT NULL,
    `content` MEDIUMTEXT NOT NULL,
    `risk_flag` VARCHAR(32) NULL,
    `model_vendor` VARCHAR(64) NULL,
    `model_version` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `t_followup_message_message_id_key`(`message_id`),
    INDEX `t_followup_message_reading_id_created_at_idx`(`reading_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_risk_event` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `event_id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(64) NULL,
    `session_id` VARCHAR(64) NULL,
    `reading_id` VARCHAR(64) NULL,
    `order_id` VARCHAR(64) NULL,
    `scene` VARCHAR(32) NOT NULL,
    `trigger_type` VARCHAR(64) NULL,
    `trigger_content_hash` VARCHAR(128) NULL,
    `risk_level` VARCHAR(16) NOT NULL,
    `risk_tags` JSON NULL,
    `action_taken` VARCHAR(64) NOT NULL,
    `review_status` VARCHAR(32) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_risk_event_event_id_key`(`event_id`),
    INDEX `t_risk_event_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `t_risk_event_reading_id_idx`(`reading_id`),
    INDEX `t_risk_event_scene_risk_level_created_at_idx`(`scene`, `risk_level`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_operation_audit_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `log_id` VARCHAR(64) NOT NULL,
    `operator_id` VARCHAR(64) NOT NULL,
    `module_name` VARCHAR(64) NOT NULL,
    `operation_type` VARCHAR(64) NOT NULL,
    `target_id` VARCHAR(64) NULL,
    `before_snapshot` JSON NULL,
    `after_snapshot` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `t_operation_audit_log_log_id_key`(`log_id`),
    INDEX `t_operation_audit_log_operator_id_created_at_idx`(`operator_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_protocol_version` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `protocol_id` VARCHAR(64) NOT NULL,
    `protocol_type` VARCHAR(32) NOT NULL,
    `version` VARCHAR(32) NOT NULL,
    `title` VARCHAR(128) NOT NULL,
    `content` MEDIUMTEXT NOT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'active',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_protocol_version_protocol_id_key`(`protocol_id`),
    INDEX `t_protocol_version_protocol_type_status_idx`(`protocol_type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_prompt_policy_version` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `policy_version` VARCHAR(64) NOT NULL,
    `model_route_code` VARCHAR(64) NULL,
    `prompt_template` JSON NOT NULL,
    `rewrite_policy_version` VARCHAR(64) NULL,
    `fallback_policy_version` VARCHAR(64) NULL,
    `gray_scope` JSON NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'inactive',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_prompt_policy_version_policy_version_key`(`policy_version`),
    INDEX `t_prompt_policy_version_status_published_at_idx`(`status`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_topic_template` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `template_id` VARCHAR(64) NOT NULL,
    `topic_type` VARCHAR(32) NOT NULL,
    `title` VARCHAR(128) NOT NULL,
    `example_question` VARCHAR(512) NOT NULL,
    `sort_no` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(32) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `t_topic_template_template_id_key`(`template_id`),
    INDEX `t_topic_template_status_sort_no_idx`(`status`, `sort_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
