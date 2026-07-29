const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Y5IfRBbmS2FW@ep-delicate-poetry-ahi4kvos-pooler.c-3.us-east-1.aws.neon.tech/TalentPulse', ssl: { rejectUnauthorized: false } });
  try {
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('tables:', tables.rows.map(r => r.table_name).join(', '));
    for (const { table_name } of tables.rows) {
      const count = await pool.query(`SELECT count(*)::int AS cnt FROM public."${table_name}"`);
      console.log(table_name, count.rows[0].cnt);
    }
  } catch (err) {
    console.error('ERROR', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
