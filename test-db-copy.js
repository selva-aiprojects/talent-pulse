const { Pool } = require('pg');

async function main() {
  const source = new Pool({ connectionString: 'postgresql://orqohire:whitekraaft%403030@69.12.82.14:5432/orqohire' });
  const target = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Y5IfRBbmS2FW@ep-delicate-poetry-ahi4kvos-pooler.c-3.us-east-1.aws.neon.tech/postgres', ssl: { rejectUnauthorized: false } });
  try {
    console.log('Connecting to source...');
    await source.query('SELECT 1');
    console.log('Source connected.');

    console.log('Listing source tables...');
    const srcRes = await source.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name");
    console.log(JSON.stringify(srcRes.rows, null, 2));

    console.log('Connecting to target...');
    await target.query('SELECT 1');
    console.log('Target connected.');

    const dbName = 'TalentPulse';
    const exists = await target.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (exists.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await target.query(`CREATE DATABASE "${dbName}" OWNER neondb_owner`);
      console.log('Database created.');
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  } finally {
    await source.end().catch(() => {});
    await target.end().catch(() => {});
  }
}

main();
