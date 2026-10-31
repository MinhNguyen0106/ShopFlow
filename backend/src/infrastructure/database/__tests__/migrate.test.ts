/**
 * ShopFlow - Migration Runner Unit Tests
 * File: backend/src/infrastructure/database/__tests__/migrate.test.ts
 */

import { describe, it, expect } from 'vitest';
import { cleanSqlScript } from '../migrate.js';

describe('cleanSqlScript()', () => {
  it('nên loại bỏ các lệnh meta-command của psql bắt đầu bằng dấu gạch chéo ngược', () => {
    const rawSql = `
\\set ON_ERROR_STOP on
\\connect shopflow_db
CREATE TABLE IF NOT EXISTS test_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL
);
\\echo 'Done'
`;

    const cleaned = cleanSqlScript(rawSql);

    expect(cleaned).not.toContain('\\set ON_ERROR_STOP on');
    expect(cleaned).not.toContain('\\connect shopflow_db');
    expect(cleaned).not.toContain('\\echo');
    expect(cleaned).toContain('CREATE TABLE IF NOT EXISTS test_table');
    expect(cleaned).toContain('id UUID PRIMARY KEY DEFAULT uuid_generate_v4()');
  });

  it('nên xử lý đúng các dòng có khoảng trắng đứng trước lệnh meta-command', () => {
    const rawSql = `
  \\set ON_ERROR_STOP on
\t\\set QUIET 1
SELECT 1;
`;

    const cleaned = cleanSqlScript(rawSql);

    expect(cleaned).not.toContain('\\set ON_ERROR_STOP on');
    expect(cleaned).not.toContain('\\set QUIET 1');
    expect(cleaned).toContain('SELECT 1;');
  });

  it('nên giữ nguyên toàn bộ các câu lệnh SQL, transaction và comments hợp lệ', () => {
    const rawSql = `
-- Migration comment
BEGIN;

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL
);

/* Block comment */
COMMIT;
`;

    const cleaned = cleanSqlScript(rawSql);

    expect(cleaned).toContain('-- Migration comment');
    expect(cleaned).toContain('BEGIN;');
    expect(cleaned).toContain('CREATE TABLE users');
    expect(cleaned).toContain('/* Block comment */');
    expect(cleaned).toContain('COMMIT;');
  });

  it('nên giữ nguyên chuỗi rỗng khi đầu vào là rỗng', () => {
    expect(cleanSqlScript('')).toBe('');
  });
});
