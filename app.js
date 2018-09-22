var sql = require("mysql");
var inquire = require("inquirer");
var connection = sql.createConnection({
    host: "127.0.0.1",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
  });
var emp_id = 0;
var emp_auth = 0;
var emp_name = "";
  connection.connect(function(err) {
    if (err) throw err;
    //console.log("connected as id " + connection.threadId + "\n");
  });

function login(){
    inquire.prompt([
        {
            name: "id",
            message: "Enter employee ID",
            type: "text"
        },{
            name: "pw",
            message: "Enter password",
            type: "number"
        }
    ]).then(function(data){
        connection.query("SELECT * FROM emp_dbo WHERE emp_id LIKE " + data.id,(err,res) => {
            if (err){
                console.log(err);
                return connection.end();
            };
            if (res.length === 0){
                console.log("ID not found!");
                return login();
            }
            var pw = parseInt(data.pw);
                if(pw === res[0].pw){
                    emp_auth = res[0].emp_auth;
                    emp_id = data.id;
                    emp_name = res[0].name;
                    console.log("login successful!")
                    //whatDo();
                } else {
                    console.log("incorrect pw!");
                }
        });
        
    });
}
function whatDo(){
    inquire.prompt([
        {

        },{
            
        }
    ])
}
 login();
//connection.end();