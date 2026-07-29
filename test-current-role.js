const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Y5IfRBbmS2FW@ep-delicate-poetry-ahi4kvos-pooler.c-3.us-east-1.aws.neon.tech/TalentPulse', ssl: { rejectUnauthorized: false } });
  const sql = `DROP TABLE IF EXISTS public.passport_test CASCADE;
CREATE TABLE public.passport_test (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  candidate_id uuid NOT NULL,
  phone varchar(50),
  current_role varchar(255)
);
`;
  console.log(sql);
  try {
    const res = await pool.query(sql);
    console.log('OK', res.command);
  } catch (err) {
    console.error('ERROR', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
})();
