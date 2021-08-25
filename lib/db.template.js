var mysql = require('mysql');
var db = mysql.createConnection({
    host : '',
    user : '',
    password : '',
    database : '',
    multipleStatements:true//여러개의 sql문을 허용 기본값 false
    /* db.query('SELECT * FROM author WHERE id=?',[queryData.id], 
        매개변수로 주면 injection을 막아줌 => (' id;추가된내용 ') 이런식으로 막아줌
        db.query('SELECT * FROM author WHERE id=${db.escape(queryData.id)}'
        이스케이프를 사용하여도 막아줌 => (' id;추가된내용 ') 이런식으로 막아줌
        
    */
});
db.connect();

module.exports = db;