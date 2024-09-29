const { query } = require('express');
const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "159753",
    database: "communicationltd",
    multipleStatements: true
};
// Create a connection pool to MySQL
const db = mysql.createPool(dbConfig);

// Export the pool
module.exports = {db,dbConfig,query};