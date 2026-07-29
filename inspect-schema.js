const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://orqohire:whitekraaft%403030@69.12.82.14:5432/orqohire' });
  try {
    const tabs = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    console.log(JSON.stringify(tabs.rows, null, 2));
    for (const { table_name } of tabs.rows) {
      const cols = await pool.query(SELECT column_name, data_type, is_nullable, column_default, character_maximum_length, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_schema='public' AND table_name =  ORDER BY ordinal_position, [table_name]);
      const seqs = await pool.query(SELECT column_name, pg_get_serial_sequence(quote_ident(table_name), column_name) AS seqname FROM information_schema.columns WHERE table_schema='public' AND table_name= AND column_default LIKE 'nextval(%', [table_name]);
      console.log('TABLE', table_name);
      console.log(JSON.stringify(cols.rows, null, 2));
      console.log('SEQS', JSON.stringify(seqs.rows, null, 2));
    }
  } catch (err) { console.error(err); process.exit(1); } finally { await pool.end(); }
})();
