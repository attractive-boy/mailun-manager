// db.js
import knex from "knex";

const db = knex({
  client: "mysql2",
  connection: {
    host: "8.140.53.229",
    user: "root",
    password: "053229",
    database: "mailoon",
  },
  pool: { min: 0, max: 7 },
}); // 使用你配置的环境

export default db;
