const { prompt } = require("inquirer");
const logo = require("asciiart-logo");

const mysql2 = require('mysql2');
const { get } = require("prompt");

init();

// the mysql2 module to create a connection to a MySQL database. 
const conn = mysql2.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "4685",
    database: "employees_db"
});

// error handling to ensure that any connection errors are detected and properly handled.
conn.connect(function (err) {
    if (err) throw err;
});

// render employee manager logo text
function init() {
    const logoText = logo({ name: "Employee Tracker" }).render();

    console.log(logoText);

    // load user prompt
    userPrompt();
}
// view all departments, roles, and employees. 
// add a department, role, add an employee.
// update an employee role.
function userPrompt() {
    prompt([
        {
            type: 'list',
            name: 'options',
            message: 'What would you like to do?',
            choices: [
                'View all Departments',
                'View all Roles',
                'View all Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee Role',
                'Exit'
            ]
        }
    ]).then(answer => {
        switch (answer.options) {
            // Calling the appropriate functions
            case 'View all Departments':
                viewDepartments();
                break;
            case 'View all Roles':
                viewRoles();
                break;
            case 'View all Employees':
                viewEmployees();
                break;
            case 'Add a Department':
                addDepartment();
                break;
            case 'Add a Role':
                addRole();
                break;
            case 'Add an Employee':
                addEmployee();
                break;
            case 'Update an Employee Role':
                updateEmployeeRole();
                break;
            case 'Exit':
                Exit();
                break;
        }
    });
}

// 'View all Departments':
async function viewDepartments() {
    try {
        const res = await new Promise((resolve, reject) => {
            conn.query('SELECT department.id, department.name FROM department;', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // console log message to confirm that the department has been added
        console.log("\n");
        console.table(res);
        userPrompt();
    } catch (err) {
        console.error(err);
    }
}

// 'View all Roles':
async function viewRoles() {
    try {
        const res = await new Promise((resolve, reject) => {
            conn.query('SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // console log message to confirm that the role has been added
        console.log("\n");
        console.table(res);
        userPrompt();
    } catch (err) {
        console.error(err);
    }
}

// 'View all Employees':
async function viewEmployees() {
    try {
        const res = await new Promise((resolve, reject) => {
            conn.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // console log message to confirm that the employee has been added
        console.log("\n");
        console.table(res);
        userPrompt();
    } catch (err) {
        console.error(err);
    }
}

// 'Add a Department':
async function addDepartment() {
    try {
        const answer = await prompt({
            name: 'name',
            message: "What is the name of the department?"
        });

        // ensures that the department is added
        await new Promise((resolve, reject) => {
            conn.query('INSERT INTO department SET ?', { name: answer.name }, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        // console log message to confirm that the department has been added
        console.log(`Added Department!`);
        userPrompt();
    } catch (err) {
        console.error(err);
    }
}

// 'Add a Role':
async function addRole() {
    try {
        const [rows] = await getAllDepartments();
        const departments = rows;
        const departmentOptions = departments.map(({ id, name }) => ({
            name: name,
            value: id
        }));

        const answers = await prompt([
            {
                name: 'title',
                message: "What is the name of the role?"
            },
            {
                name: 'salary',
                message: "What is the salary of the role?"
            },
            {
                type: 'list',
                name: "department_id",
                message: "Which department does the role belong to?",
                choices: departmentOptions
            }
        ]);

        await new Promise((resolve, reject) => {
            conn.query('INSERT INTO role SET ?', answers, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        // console log message to confirm that the role has been added
        console.log("\n");
        console.log('Added Role!');
        userPrompt();
    } catch (err) {
        console.error('Role not added!', err);
        await addRole();
    }
}
// function that return all departments
function getAllDepartments() {
    return conn.promise().query(
        "SELECT department.id, department.name FROM department;"
    );
}

// 'Add an Employee':
async function addEmployee() {
    try {
        const answers = await prompt([
            {
                name: "first_name",
                message: "What is the employee's first name?"
            },
            {
                name: "last_name",
                message: "What is the employee's last name?"
            }
        ]);

        const firstName = answers.first_name;
        const lastName = answers.last_name;
        
        const [rows] = await getAllRoles(); 
        const roles = rows;
        const roleOptions = roles.map(({ id, title }) => ({
            name: title,
            value: id
        }));

        // prompt to select a role for the employee
        const roleAnswer = await prompt({
            type: 'list',
            name: 'role_id',
            message: "What is the employee's role?",
            choices: roleOptions
        });

        // get all employees to select a manager
        const [employeeRows] = await getAllEmployees();
        let employees = employeeRows;
        const managerOptions = employees.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id
        }));
        
        managerOptions.unshift({ name: "None", value: null });

        //prompt to select a manager for the employee
        const managerAnswer = await prompt({
            type: "list",
            name: "managerId",
            message: "Who is the employee's manager?",
            choices: managerOptions
        });

        const employee = {
            manager_id: managerAnswer.managerId,
            role_id: roleAnswer.role_id,
            first_name: firstName,
            last_name: lastName
        };
        // ensures that the employee is added
        await new Promise((resolve, reject) => {
            conn.query('INSERT INTO employee SET ?', employee, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
        // console log message to confirm that the employee has been added
        console.log('Added Employee!');
        userPrompt();
    } catch (err) {
        console.error('Error adding employee:', err);
    }
}

// get all roles
function getAllRoles() {
    return conn.promise().query(
        "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;"
    );
}

// get all employees
function getAllEmployees() {
    return this.conn.promise().query(
      "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
    );
}

// 'Update an Employee Role':
async function updateEmployeeRole() {
    try {
        const [employeeRows] = await getAllEmployees();
        const employees = employeeRows;
        const employeeOptions = employees.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id
        }));

        //select an employee to update
        const { employeeId } = await prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Which employee's role do you want to update?",
                choices: employeeOptions
            }
        ]);

        // select a new role for the employee
        const [roleRows] = await getAllRoles();
        const roles = roleRows;
        const roleOptions = roles.map(({ id, title }) => ({
            name: title,
            value: id
        }));

        // prompt to select a new role for the employee
        const { roleId } = await prompt([
            {
                type: "list",
                name: "roleId",
                message: "Which role do you want to assign the selected employee?",
                choices: roleOptions
            }
        ]);
        // ensures that the update operation on the employee's role is completed
        await updateEmployeeRoleInDatabase(employeeId, roleId);

        // console log message to confirm that the employee's role has been updated
        console.log('Employee role updated!');
        userPrompt();
    } catch (err) {
        console.error('Error updating employee role:', err);
    }
}

// function that updates the role of an employee in the database and returns a promise 
// if not throws an error
function updateEmployeeRoleInDatabase(employeeId, roleId) {
    return new Promise((resolve, reject) => {
        conn.query(
            'UPDATE employee SET role_id = ? WHERE id = ?',
            [roleId, employeeId],
            (err, result) => {
                if (err) reject(err);
                resolve(result);
            }
        );
    });
}

// function that returns all employees
function getAllEmployees() {
    return conn.promise().query( 
        "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
    );
}

// Exit the application
function Exit() {
    console.log("Have A Great Day!!");
    const logoText = logo({ name: "Thank you!" }).render();
    console.log(logoText);
    process.exit();
}