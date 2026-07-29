const { Pool } = require('pg');

const sourceUrl = 'postgresql://orqohire:whitekraaft%403030@69.12.82.14:5432/orqohire';
const targetUrl = 'postgresql://neondb_owner:npg_Y5IfRBbmS2FW@ep-delicate-poetry-ahi4kvos-pooler.c-3.us-east-1.aws.neon.tech/TalentPulse';

function quoteIdent(value) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatType(col) {
  const { data_type, udt_name, character_maximum_length, numeric_precision, numeric_scale } = col;
  if (data_type === 'character varying') return `varchar(${character_maximum_length || 255})`;
  if (data_type === 'character') return `char(${character_maximum_length || 1})`;
  if (data_type === 'numeric' || data_type === 'decimal') {
    if (numeric_precision && numeric_scale != null) return `numeric(${numeric_precision}, ${numeric_scale})`;
    return 'numeric';
  }
  if (data_type === 'ARRAY') {
    return udt_name.replace(/^_/, '') + '[]';
  }
  return data_type;
}

function transformValue(col, value) {
  if (value === null || value === undefined) return null;
  if (col.data_type === 'json' || col.data_type === 'jsonb') {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
  if (col.data_type === 'ARRAY') {
    return value;
  }
  return value;
}

(async () => {
  const source = new Pool({ connectionString: sourceUrl });
  const target = new Pool({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });

  try {
    console.log('Creating extension pgcrypto on target');
    await target.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    const tablesRes = await source.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    const tables = tablesRes.rows.map(r => r.table_name);

    const fkDefs = [];
    const indexDefs = [];

    for (const table of tables) {
      console.log(`\nProcessing table: ${table}`);
      const colsRes = await source.query(`SELECT column_name, data_type, is_nullable, column_default, character_maximum_length, numeric_precision, numeric_scale, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 ORDER BY ordinal_position`, [table]);
      const cols = colsRes.rows;

      const pkRes = await source.query(`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = $1::regclass AND contype = 'p'`, [table]);
      const uqRes = await source.query(`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = $1::regclass AND contype = 'u'`, [table]);
      const fkRes = await source.query(`SELECT conname, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = $1::regclass AND contype = 'f'`, [table]);
      const idxRes = await source.query(`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=$1`, [table]);

      const colDefs = cols.map(col => {
        const type = formatType(col);
        const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : '';
        const def = col.column_default ? `DEFAULT ${col.column_default}` : '';
        return `  ${quoteIdent(col.column_name)} ${type} ${def} ${nullable}`.replace(/\s+/g, ' ').trim();
      });

      const constraints = [];
      if (pkRes.rows.length) constraints.push(pkRes.rows.map(r => r.def).join(', '));
      if (uqRes.rows.length) constraints.push(...uqRes.rows.map(r => r.def));
      const tableSQL = `DROP TABLE IF EXISTS public.${quoteIdent(table)} CASCADE;\nCREATE TABLE public.${quoteIdent(table)} (\n${colDefs.join(',\n')} ${constraints.length ? ',\n' + constraints.join(',\n') : ''}\n);`;
      console.log(tableSQL);
      await target.query(tableSQL);

      if (fkRes.rows.length) {
        fkDefs.push(...fkRes.rows.map(r => ({ table, def: r.def })));
      }

      for (const idx of idxRes.rows) {
        if (idx.indexname === `${table}_pkey`) continue;
        if (uqRes.rows.some(u => idx.indexname.includes(u.conname))) continue;
        indexDefs.push(idx.indexdef.replace('CREATE INDEX', `CREATE INDEX IF NOT EXISTS`));
      }

      const srcData = await source.query(`SELECT * FROM public.${table}`);
      if (srcData.rows.length === 0) {
        console.log(`Table ${table} has no rows, skipping data copy.`);
      } else {
        console.log(`Copying ${srcData.rowCount} rows into ${table}...`);
        const columns = cols.map(c => quoteIdent(c.column_name));
        const placeholder = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertSQL = `INSERT INTO public.${quoteIdent(table)} (${columns.join(', ')}) VALUES (${placeholder})`;
        for (const row of srcData.rows) {
          const values = cols.map(col => transformValue(col, row[col.column_name]));
          try {
            await target.query(insertSQL, values);
          } catch (err) {
            console.error(`Row insert failed for table ${table}. id=${row.id || 'unknown'}`);
            console.error(err);
            console.error('VALUES', JSON.stringify(values));
            throw err;
          }
        }
      }

      const seqColsRes = await source.query(`SELECT column_name, pg_get_serial_sequence(quote_ident(table_name), column_name) AS seqname FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 AND column_default LIKE 'nextval(%'`, [table]);
      for (const seqRow of seqColsRes.rows) {
        const seq = seqRow.seqname;
        const col = seqRow.column_name;
        if (!seq) continue;
        console.log(`Setting sequence ${seq} for ${table}.${col}`);
        await target.query(`SELECT setval($1, COALESCE((SELECT MAX(${quoteIdent(col)}) FROM public.${quoteIdent(table)}), 1), true)`, [seq]);
      }
    }

    if (fkDefs.length) {
      console.log('\nApplying foreign key constraints...');
      for (const fk of fkDefs) {
        const q = `ALTER TABLE public.${fk.table} ADD ${fk.def};`;
        console.log(q);
        await target.query(q);
      }
    }

    if (indexDefs.length) {
      console.log('\nCreating indexes...');
      for (const idx of indexDefs) {
        console.log(idx);
        await target.query(idx);
      }
    }

    console.log('\nDatabase clone complete.');
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    await source.end().catch(() => {});
    await target.end().catch(() => {});
  }
})();
