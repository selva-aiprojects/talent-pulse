const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://orqohire:whitekraaft%403030@69.12.82.14:5432/orqohire' });
  try {
    const tabs = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    for (const { table_name } of tabs.rows) {
      console.log('TABLE', table_name);
      const cols = await pool.query(`SELECT column_name, data_type, is_nullable, column_default, character_maximum_length, numeric_precision, numeric_scale, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 ORDER BY ordinal_position`, [table_name]);
      console.log('COLUMNS', JSON.stringify(cols.rows, null, 2));
      const pks = await pool.query(`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = $1::regclass AND contype = 'p'`, [table_name]);
      const fks = await pool.query(`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = $1::regclass AND contype = 'f'`, [table_name]);
      const uqs = await pool.query(`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = $1::regclass AND contype = 'u'`, [table_name]);
      const idxs = await pool.query(`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=$1`, [table_name]);
      console.log('PKS', JSON.stringify(pks.rows, null, 2));
      console.log('FKS', JSON.stringify(fks.rows, null, 2));
      console.log('UQS', JSON.stringify(uqs.rows, null, 2));
      console.log('IDX', JSON.stringify(idxs.rows, null, 2));
    }
  } catch (err) { console.error(err); process.exit(1); } finally { await pool.end(); }
})();
