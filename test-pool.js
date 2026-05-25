const { Pool } = require("pg");

try {
  const pool = new Pool({
    connectionString: "postgresql://postgres:password@localhost:5432/db?pgbouncer=true"
  });
  console.log("Success pool create");
} catch(e) {
  console.error("Error:", e);
}
