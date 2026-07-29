const { Pool } = require('pg');
const sourceUrl = 'postgresql://orqohire:whitekraaft%403030@69.12.82.14:5432/orqohire';
const targetUrl = 'postgresql://neondb_owner:npg_Y5IfRBbmS2FW@ep-delicate-poetry-ahi4kvos-pooler.c-3.us-east-1.aws.neon.tech/TalentPulse';
(async () => {
  const source = new Pool({ connectionString: sourceUrl });
  const target = new Pool({ connectionString: targetUrl, ssl: { rejectUnauthorized: false } });
  try {
    const srcTables = await source.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    console.log('SOURCE TABLES');
    for (const { table_name } of srcTables.rows) {
      const cnt = await source.query(`SELECT count(*)::int AS cnt FROM public."${table_name}"`);
      console.log(`${table_name}: ${cnt.rows[0].cnt}`);
    }
    const tgtTables = await target.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    console.log('\nTARGET TABLES');
    for (const { table_name } of tgtTables.rows) {
      const cnt = await target.query(`SELECT count(*)::int AS cnt FROM public."${table_name}"`);
      console.log(`${table_name}: ${cnt.rows[0].cnt}`);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await source.end();
    await target.end();
  }
})();
