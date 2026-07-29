const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Y5IfRBbmS2FW@ep-delicate-poetry-ahi4kvos-pooler.c-3.us-east-1.aws.neon.tech/TalentPulse', ssl: { rejectUnauthorized: false } });
  try {
    const checks = [
      { table: 'users', expr: "email ILIKE '%orqohire%' OR name ILIKE '%orqo%'" },
      { table: 'candidates', expr: "full_name ILIKE '%orqo%' OR email ILIKE '%orqo%'" },
      { table: 'passports', expr: "full_name ILIKE '%orqo%'" },
      { table: 'verification_requests', expr: "token ILIKE '%orqo%'" },
      { table: 'audit_log', expr: "details ILIKE '%orqo%' OR entity ILIKE '%orqo%'" },
    ];
    for (const check of checks) {
      const res = await pool.query(`SELECT COUNT(*)::int AS cnt FROM public.${check.table} WHERE ${check.expr}`);
      console.log(`${check.table}: ${res.rows[0].cnt}`);
      if (res.rows[0].cnt > 0) {
        const rows = await pool.query(`SELECT * FROM public.${check.table} WHERE ${check.expr} LIMIT 20`);
        console.log(JSON.stringify(rows.rows, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
