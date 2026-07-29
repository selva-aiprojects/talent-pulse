const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://orqohire:whitekraaft%403030@69.12.82.14:5432/orqohire' });
  try {
    const cols = await pool.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='candidates' ORDER BY ordinal_position");
    console.log('COLUMNS', JSON.stringify(cols.rows, null, 2));
    const rows = await pool.query('SELECT id, primary_skills, secondary_skills, location_preferred FROM public.candidates LIMIT 5');
    console.log('ROWS', JSON.stringify(rows.rows, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
