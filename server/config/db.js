const mysql = require("mysql2/promise"); // Use promise-based mysql2
 
const mysqlPool = mysql.createPool({
    host: "",
    user: "",
    password: "",
    database: "student_portal",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = mysqlPool;
