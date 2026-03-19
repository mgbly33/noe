import { config } from 'dotenv';
import mysql from 'mysql2/promise';

config();

const expectedSkus = [
  'sku_one_card_single',
  'sku_three_cards_single',
  'sku_three_cards_pack3',
] as const;

const expectedActivePolicy = 'prompt_policy_v1';

const main = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to verify seed data.');
  }

  const connection = await mysql.createConnection(databaseUrl);

  try {
    const [skuRows] = await connection.query<
      Array<{ sku_id: string }>
    >(
      `
        SELECT sku_id
        FROM t_product_sku
        WHERE sku_id IN (?, ?, ?)
          AND status = 'active'
      `,
      [...expectedSkus],
    );

    const foundSkus = new Set(skuRows.map((row) => row.sku_id));
    const missingSkus = expectedSkus.filter((skuId) => !foundSkus.has(skuId));

    if (missingSkus.length > 0) {
      throw new Error(`Missing seeded SKUs: ${missingSkus.join(', ')}`);
    }

    const [policyRows] = await connection.query<
      Array<{ policy_version: string }>
    >(
      `
        SELECT policy_version
        FROM t_prompt_policy_version
        WHERE status = 'active'
        ORDER BY published_at DESC, created_at DESC
        LIMIT 1
      `,
    );

    const activePolicy = policyRows[0]?.policy_version;

    if (activePolicy !== expectedActivePolicy) {
      throw new Error(
        `Expected active prompt policy ${expectedActivePolicy}, received ${activePolicy ?? 'none'}.`,
      );
    }

    console.log(`Seed verification passed for ${expectedSkus.length} SKUs and active policy ${activePolicy}.`);
  } finally {
    await connection.end();
  }
};

void main();
