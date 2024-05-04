USE employees_db;

INSERT INTO department (name)
VALUES  ('Sales'),
        ('Engineering'),
        ('Finance'),
        ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES  ('Sales Lead', 200000, 1),
        ('Salesperson', 90000, 1),
        ('Lead Engineer', 160000, 2),
        ('Software Engineer', 130000, 2),
        ('Account Manager', 170000, 3),
        ('Accountant', 130000, 3),
        ('Legal Team Lead', 300000, 4),
        ('Lawyer', 200000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ('Anthony', 'Wiggins', 1, NULL),
        ('Brenden', 'Culter', 2, 1),
        ('Gary', 'Jones', 3, NULL),
        ('David', 'Parker', 4, 3);
        ('Justin', 'Duhaney', 5, NULL),
        ('Dave', 'Fits', 6, 5),
        ('Chaz', 'Green', 7, NULL),
        ('Mark', 'Blakeney', 8, 7);  
