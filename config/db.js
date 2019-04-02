const mysql = require('mysql');
let pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    prot: '3306',
    database: 'swq'
})
let query = function (sql, arr, callback) {
    pool.getConnection(function (err, connection) {
        if(err) return err;
        connection.query(sql, arr, function (error, result, fields) {
            connection.release();
            if(error) return error;
            callback && callback(result, fields);
        })
    })
};
module.exports = {query};