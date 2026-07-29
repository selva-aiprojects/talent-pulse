const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Y5IfRBbmS2FW@ep-delicate-poetry-ahi4kvos-pooler.c-3.us-east-1.aws.neon.tech/TalentPulse', ssl: { rejectUnauthorized: false } });
  const sql = `DROP TABLE IF EXISTS public.passports CASCADE;
CREATE TABLE public.passports (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  candidate_id uuid NOT NULL,
  status varchar(20),
  trust_score integer DEFAULT 0,
  completion_percent integer DEFAULT 0,
  full_name varchar(255),
  email varchar(255),
  phone varchar(50),
  current_role varchar(255),
  total_experience varchar(50),
  skills text,
  location varchar(255),
  notice_period varchar(100),
  linkedin_url text,
  resume_link text,
  consent_given boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (candidate_id)
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
