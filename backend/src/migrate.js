const fs = require('fs');
const path = require('path');
const { pool } = require('./config/db');

async function migrate() {
  try {
    const migrationPath = path.join(__dirname, '..', 'db', 'optimize_schema.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migrationSql);
    console.log('Database migration completed successfully.');
  } catch (err) {
    console.error('Error running database migration:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = { migrate };
