const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://orqohire:whitekraaft%403030@69.12.82.14:5432/orqohire' });
  try {
    const res = await pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) { console.error(err); process.exit(1); } finally { await pool.end(); }
})();
