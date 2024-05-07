const { prompt } = require("inquirer");
const logo = require("asciiart-logo");

const mysql2 = require('mysql2');

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

        await new Promise((resolve, reject) => {
            conn.query('INSERT INTO department SET ?', { name: answer.name }, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        console.log('Added Department!');
        userPrompt();
    } catch (err) {
        console.error(err);
    }
}

// 'Add a Role':
async function addRole() {
    try {
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
                type: 'input',
                name: 'department',
                message: 'Enter the department for the role:'
                // type: "list",
                // name: 'department_id',
                // message: "Which department does the role belong to?",
                // choices: departmentName
                // // choices: ['Sales','Engineering','Finance','Legal']
            }
        ]);

        await new Promise((resolve, reject) => {
            conn.query('INSERT INTO role SET ?', answers, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        console.log('Added Role!');
        userPrompt();
    } catch (err) {
        console.error('Role not added!', err);
        await addRole();
    }
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
            },
            {
                type: 'list',
                name: 'role_id',
                message: "What is the employee's role?",
                choices: await roleChoices()
            },
            {
                type: 'input',
                name: 'manager_id',
                message: "Who is the employee's manager?",
            }
        ]);

        const res = await new Promise((resolve, reject) => {
            conn.query('INSERT INTO employee SET ?', answers, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });

        console.log('Added Employee!');
        userPrompt();
    } catch (err) {
        console.error(err);
    }
}

// 'Update an Employee Role':
async function updateEmployeeRole() {
    try {
        const employees = await new Promise((resolve, reject) => {
            conn.query('SELECT * FROM employee', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        if (employees.length === 0) {
            console.log("Employee not found.");
            userPrompt();
            return;
        }

        // Create choices for the employee selection prompt
        const employeeChoices = employees.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
        }));

        // Prompt the user to select an employee to update
        const { employeeId } = await prompt({
            type: 'list',
            name: 'employeeId',
            message: 'Select an employee to update:',
            choices: employeeChoices
        });

        // Prompt the user to enter the new role ID
        const { newRoleId } = await prompt({
            type: 'list',
            message: "Which role do you want to assign the selected employee?",
            choices: roleChoices
        });

        // Update the employee's role in the database
        const updateResult = await new Promise((resolve, reject) => {
            conn.query(
                'UPDATE employee SET role_id = ? WHERE id = ?',
                [newRoleId, employeeId],
                (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                }
            );
        });

        if (updateResult.affectedRows > 0) {
            console.log('Employee role updated!');
        } else {
            console.log('Employee role not updated!');
        }

        // Prompt the user with the main options again
        promptUser();
    } catch (err) {
        console.error('Error updating employee role:', err);
    }
}
// Exit the application
function Exit() {
    console.log("Have A Great Day!!");
    const logoText = logo({ name: "Thank you!" }).render();
    console.log(logoText);
    process.exit();
}