// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.jrjlwfanwvjguiewjuwd:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres',
});

module.exports = pool;
