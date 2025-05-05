const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Cambiar por la contraseña de tu base de datos
  database: 'dbpractica02',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

async function initializeDatabase() {
  const createRolesTable = `
    CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE
    )
  `;
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(255),
      role_id INT,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
    )
  `;

  const connection = await promisePool.getConnection();
  try {
    await connection.query(createRolesTable);
    await connection.query(createUsersTable);
  } finally {
    connection.release();
  }
}

initializeDatabase().catch(err => {
  console.error('Error initializing database:', err);
});

module.exports = promisePool;
