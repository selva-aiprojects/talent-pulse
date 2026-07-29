const { Pool } = require('pg');
function formatType(col) {
  const { data_type, udt_name, character_maximum_length, numeric_precision, numeric_scale } = col;
  if (data_type === 'character varying') return `varchar(${character_maximum_length || 255})`;
  if (data_type === 'character') return `char(${character_maximum_length || 1})`;
  if (data_type === 'numeric' || data_type === 'decimal') {
    if (numeric_precision && numeric_scale != null) return `numeric(${numeric_precision}, ${numeric_scale})`;
    return 'numeric';
  }
  if (data_type === 'ARRAY') return udt_name.replace('_','') + '[]';
  return data_type;
}
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://orqohire:whitekraaft%403030@69.12.82.14:5432/orqohire' });
  try {
    const cols = await pool.query("SELECT column_name, data_type, is_nullable, column_default, character_maximum_length, numeric_precision, numeric_scale, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='passports' ORDER BY ordinal_position");
    console.log('COLS', JSON.stringify(cols.rows, null, 2));
    const pks = await pool.query(`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = $1::regclass AND contype = 'p'`, ['passports']);
    const uqs = await pool.query(`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = $1::regclass AND contype = 'u'`, ['passports']);
    console.log('PKS', JSON.stringify(pks.rows, null, 2));
    console.log('UQS', JSON.stringify(uqs.rows, null, 2));
    const colDefs = cols.rows.map(col => {
      const type = formatType(col);
      const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : '';
      const def = col.column_default ? `DEFAULT ${col.column_default}` : '';
      return `  ${col.column_name} ${type} ${def} ${nullable}`.replace(/\s+/g,' ').trim();
    });
    const constraints = [];
    if (pks.rows.length) constraints.push(pks.rows.map(r => r.def).join(', '));
    if (uqs.rows.length) constraints.push(...uqs.rows.map(r => r.def));
    const sql = `DROP TABLE IF EXISTS public.passports CASCADE;\nCREATE TABLE public.passports (\n${colDefs.join(',\n')} ${constraints.length ? ',\n' + constraints.join(',\n') : ''}\n);`;
    console.log('SQL');
    console.log(sql);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
