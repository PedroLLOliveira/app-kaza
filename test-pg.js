const { parse } = require("pg-connection-string");

const config = parse("postgres://user:pass@host:5432/db?sslmode=require");
console.log(config);
