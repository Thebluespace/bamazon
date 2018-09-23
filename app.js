var tables = require("console.table");
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
var userPermissions = {};
var cart = [];
var total = 0;
  connection.connect(function(err) {
    if (err) throw err;
    //console.log("connected as id " + connection.threadId + "\n");
  });

function init(){
    inquire.prompt([
        {
            name: "id",
            message: "Welcome to Bamazon!",
            type: "list",
            choices: ["Make Sale","Employee Login"]
        }
    ]).then(function(data){
        if (data.id === "Make Sale") {
            emp_auth = 0;
            setAuth();
        } else {
            inquire.prompt([
                {
                    name: "id",
                    type: "input",
                    message: "Please input employee ID"
                },{
                    name: "pw",
                    type: "password",
                    message: "Please input password"
                }
            ]).then( data => {
                logIn(data.id, data.pw);
            })
            
        }
    });
}
function setAuth(){
        userPermissions = []
        userPermissions.push("Make Sale");
        if (emp_auth === 0){
            userPermissions.push("Employee Login");
            return makeSale();
        }
        if (emp_auth > 0){  
            
            userPermissions.push("Check Inventory");
        }
        if (emp_auth > 1){
            userPermissions.push("Restock Inventory");
            userPermissions.push("Check Sales");
        }
        if (emp_auth > 2){
            userPermissions.push("Add Employee");
            userPermissions.push("Remove Employee");
        }
        whatDo();
}
function whatDo(){
    console.clear();
    // console.log(emp_auth,userPermissions);
    inquire.prompt([
        {
            name: "action",
            type: "list",
            message: "Please choose an action",
            choices: userPermissions
        }
    ]).then(data => {
        switch(data.action){
            case "Make Sale":
                makeSale();
            return;
            case "Employee Login":
                logIn();
            return;
            case "Check Inventory":
                checkInventory();
            return;
            case "Restock Inventory":
                restockInventory();
            return;
            case "Check Sales":
                checkSales();
            return;
            case "Add Employee":
                addEmployee();
            return;
            case "Remove Employee":
                removeEmployee();
            return;
        }
    });
}
function logIn(id, pw){
    connection.query("SELECT * FROM emp_dbo WHERE emp_id LIKE " + id,(err,res) => {
        if (err){
            console.log(err);
            return connection.end();
        };
        if (res.length === 0){
            console.log("ID not found!");
            return login();
        }
            if(pw == res[0].pw){
                emp_auth = res[0].emp_auth;
                emp_id = id;
                emp_name = res[0].name;
                console.log("login successful!")
                setAuth();
            } else {
                console.log("incorrect pw!");
            }
    });
}
function makeSale(){
    connection.query("SELECT * FROM products", (err,data) => {
        if (err){ return console.log(err);}
        var items = [];
        data.forEach(element => {
            var newItem = {
                SKU: element.item_id,
                name: element.product_name,
                department: element.department_name,
                price: element.price,
                quantity: element.stock_quantity
            }
            items.push(newItem);
        });
        var table = tables.getTable(items);
        console.table(table);
        addItem();

    });
}
function addItem(){
        inquire.prompt([
            {
                name: "action",
                type: "input"
            }
        ]).then(data => {
            if (data.action == "checkout"){
                checkout();
            } else {
                var id = parseInt(data.action);
                cart.push(id);
                addItem();
            }
        });
}
function findTotal(){
    connection.query("SELECT * FROM products", (err,data) => {
        if (err){return console.log(err);}
        cart.forEach(item => {
            data.forEach(db => {
                if (db.item_id === item){
                total += db.price;
                }
            });
        })
    })
}
function checkout(){
    findTotal();
    inquire.prompt([
        {
            name: "final",
            message: "Grand total: $" + total + " | Paid?",
            type: "list",
            choices: ["Yes","No"]
        }
    ]).then(data => {
       whatDo();     
    });
}
 init();
//connection.end();