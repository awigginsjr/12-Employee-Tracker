-- database schemas
DROP DATABASE IF EXISTS employees_db;

-- creates the "employees_db" database
CREATE DATABASE employees_db;

-- makes it so all of the following code will affect employees_db
USE employees_db;

-- creates the table department
CREATE TABLE department (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
);

-- creates the table role
CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL,
    department_id INT,
    FOREIGN KEY (department_id) 
    REFERENCES department(id)
);

-- creates the table employee
CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES role(id)
    FOREIGN KEY (manager_id) 
    REFERENCES employee(id)
);