const mysql = require('mysql2');
var mysqlConnection = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jewellery'
})
 mysqlConnection.connect ( (err)=>{

    if (err) {
     console.error('Error connecting to MySQL: '+ JSON.stringify(err ,undefined ,2 ));
        return;
      }
      else { 
      console.log('Connected to MySQL database' );
    }
    })

    module.exports = mysqlConnection
    
