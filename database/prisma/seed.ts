import { PrismaClient } from '@prisma/client';

import { hashPassword } from '../../apps/api/src/modules/auth/password';

const prisma = new PrismaClient();

const protocolSeeds = [
  {
    protocol_id: 'protocol_privacy_v1_0',
    protocol_type: 'privacy',
    version: 'v1.0',
    title: 'Privacy Policy v1.0',
    content: 'This is the phase-1 privacy policy placeholder for the AI Tarot MVP.',
  },
  {
    protocol_id: 'protocol_disclaimer_v1_0',
    protocol_type: 'disclaimer',
    version: 'v1.0',
    title: 'Disclaimer v1.0',
    content: 'This service provides reflective content only and does not replace professional advice.',
  },
  {
    protocol_id: 'protocol_ai_notice_v1_0',
    protocol_type: 'ai_notice',
    version: 'v1.0',
    title: 'AI Notice v1.0',
    content: 'Interpretations are generated with AI assistance and require user judgment.',
  },
  {
    protocol_id: 'protocol_age_notice_v1_0',
    protocol_type: 'age_notice',
    version: 'v1.0',
    title: 'Age Notice v1.0',
    content: 'Users should confirm they meet the minimum age requirement before continuing.',
  },
] as const;

const skuSeeds = [
  {
    sku_id: 'sku_one_card_single',
    sku_type: 'single',
    reading_type: 'one_card',
    title: 'Single Card Reading',
    sub_title: 'A fast reflection for one focused question.',
    price_amount: 19.9,
    credit_count: 1,
    validity_days: 30,
    channel_scope: 'h5',
    sort_no: 10,
  },
  {
    sku_id: 'sku_three_cards_single',
    sku_type: 'single',
    reading_type: 'three_cards',
    title: 'Three Card Reading',
    sub_title: 'A structured spread across present, obstacle, and advice.',
    price_amount: 39.9,
    credit_count: 1,
    validity_days: 30,
    channel_scope: 'h5',
    sort_no: 20,
  },
  {
    sku_id: 'sku_three_cards_pack3',
    sku_type: 'pack',
    reading_type: 'three_cards',
    title: 'Three Card Pack x3',
    sub_title: 'A reusable bundle for repeated reflection sessions.',
    price_amount: 99.0,
    credit_count: 3,
    validity_days: 90,
    channel_scope: 'h5',
    sort_no: 30,
  },
] as const;

const topicTemplateSeeds = [
  {
    template_id: 'topic_career_001',
    topic_type: 'career',
    title: 'Career',
    example_question: 'Should I switch jobs in the next three months?',
    sort_no: 10,
  },
  {
    template_id: 'topic_emotion_001',
    topic_type: 'emotion',
    title: 'Emotion',
    example_question: 'How should I approach this relationship right now?',
    sort_no: 20,
  },
  {
    template_id: 'topic_growth_001',
    topic_type: 'growth',
    title: 'Growth',
    example_question: 'What should I focus on to regain momentum this month?',
    sort_no: 30,
  },
] as const;

const main = async () => {
  const now = new Date();

  await prisma.user.upsert({
    where: { user_id: 'usr_admin_001' },
    update: {
      login_name: 'admin',
      password_hash: hashPassword('admin123456'),
      role: 'super_admin',
      channel: 'ops_console',
      nickname: 'Local Admin',
      status: 'active',
    },
    create: {
      user_id: 'usr_admin_001',
      login_type: 'local_admin',
      login_name: 'admin',
      password_hash: hashPassword('admin123456'),
      role: 'super_admin',
      channel: 'ops_console',
      nickname: 'Local Admin',
      register_time: now,
      status: 'active',
    },
  });

  for (const protocol of protocolSeeds) {
    await prisma.protocolVersion.upsert({
      where: { protocol_id: protocol.protocol_id },
      update: {
        protocol_type: protocol.protocol_type,
        version: protocol.version,
        title: protocol.title,
        content: protocol.content,
        status: 'active',
        published_at: now,
      },
      create: {
        ...protocol,
        status: 'active',
        published_at: now,
      },
    });
  }

  for (const sku of skuSeeds) {
    await prisma.productSku.upsert({
      where: { sku_id: sku.sku_id },
      update: {
        ...sku,
        status: 'active',
      },
      create: {
        ...sku,
        currency: 'CNY',
        status: 'active',
      },
    });
  }

  await prisma.promptPolicyVersion.upsert({
    where: { policy_version: 'prompt_policy_v1' },
    update: {
      model_route_code: 'mock-provider-v1',
      prompt_template: {
        system: 'You are a calm tarot guide.',
        interpretation_style: 'gentle and practical',
      },
      rewrite_policy_version: 'prompt_policy_v1_rewrite',
      fallback_policy_version: 'prompt_policy_v1_fallback',
      gray_scope: { channels: ['h5'] },
      status: 'active',
      published_at: now,
    },
    create: {
      policy_version: 'prompt_policy_v1',
      model_route_code: 'mock-provider-v1',
      prompt_template: {
        system: 'You are a calm tarot guide.',
        interpretation_style: 'gentle and practical',
      },
      rewrite_policy_version: 'prompt_policy_v1_rewrite',
      fallback_policy_version: 'prompt_policy_v1_fallback',
      gray_scope: { channels: ['h5'] },
      status: 'active',
      published_at: now,
    },
  });

  for (const topicTemplate of topicTemplateSeeds) {
    await prisma.topicTemplate.upsert({
      where: { template_id: topicTemplate.template_id },
      update: {
        ...topicTemplate,
        status: 'active',
      },
      create: {
        ...topicTemplate,
        status: 'active',
      },
    });
  }

  console.log('Seeded admin account, protocol versions, product SKUs, prompt policy, and topic templates.');
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
