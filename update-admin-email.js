const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Y5IfRBbmS2FW@ep-delicate-poetry-ahi4kvos-pooler.c-3.us-east-1.aws.neon.tech/TalentPulse', ssl: { rejectUnauthorized: false } });
  try {
    const res = await pool.query("UPDATE users SET email = 'admin@talentpulse.com' WHERE email = 'admin@orqohire.com' RETURNING email, name, role");
    console.log('UPDATED', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
