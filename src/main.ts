import { connectToDb } from './connection.js';
import inquirer from 'inquirer';
import departmentService from './service/departmentService.js';
import employeeService from './service/employeeService.js';
import roleService from './service/roleService.js';

await connectToDb();

// function to start the application
const startApplication = async () => {
    const menu = [
        {
            type: 'list',
            name: 'action',
            message: 'Please choose an option:',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add A Department',
                'Add A Role',
                'Add An Employee',
                'Update An Employee Role',
                'Exit'
            ]
        }
    ];

    // prompt the user
    const { action } = await inquirer.prompt(menu);

    // handle the user choice
    switch (action) {
        case 'View All Departments':
            viewDepartments();
            break;
        case 'View All Roles':
            viewRoles();
            break;
        case 'View All Employees':
            viewEmployees();
            break;
        case 'Add A Department':
            addDepartment();
            break;
        case 'Add A Role':
            addRole();
            break;
        case 'Add An Employee':
            addEmployee();
            break;
        case 'Update An Employee Role':
            updateEmployeeRole();
            break;
        case 'Exit':
            console.log('Exiting...');
            process.exit();
    }
};

// placeholder functions for each action
const viewDepartments = () => {
    console.log('Viewing all departments...');
    const departments = departmentService.getDepartments();
    console.table(departments);
    startApplication();  // return to main menu
};

const viewRoles = () => {
    console.log('Viewing all roles...');
    const roles = roleService.getRoles();
    console.table(roles);
    startApplication();  // return to main menu
};

const viewEmployees = () => {
    console.log('Viewing all employees...');
    const employees = employeeService.getEmployees();
    console.table(employees);
    startApplication();  // return to main menu
};

const addDepartment = async () => {
    const { departmentName } = await inquirer.prompt({
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the new department:'
    });
    console.log(`Adding department: ${departmentName}...`);
    departmentService.createDepartment(departmentName);
    startApplication();  // return to main menu
};

const addRole = async () => {
    const departments = await departmentService.getDepartments();
    const departmentNames = departments.map((department) => department.name);
    const { roleName, salary, departmentName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'roleName',
            message: 'Enter the name of the new role:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the new role:'
        },
        {
            type:'list',
            name:'departmentName',
            message: 'Select associated department:',
            choices: departmentNames
        }
    ]);
    const foundDepartment:any = departmentService.getDepartmentByName(departmentName);
    console.log(`Adding role: ${roleName} with salary: ${salary} and department: ${departmentName}...`);
    roleService.createRole(roleName, salary, foundDepartment.id);
    startApplication();  // return to main menu
};

const addEmployee = async () => {
    const roles = await roleService.getRoles();
    const roleNames =  roles.map((role) => role.title);

    const employees = await employeeService.getEmployees();
    const employeeNames = employees.map((employee) => `${employee.first_name} ${employee.last_name}`);
    const { firstName, lastName, roleName, managerName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Enter the first name of the new employee:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Enter the last name of the new employee:'
        },
        {
            type: 'list',
            name: 'roleName',
            message: 'Choose a role for the new employee:',
            choices: roleNames
        },
        {
            type: 'list',
            name: 'managerName',
            message: `Select the new employee's manager (optional):`,
            choices: [...employeeNames, 'None'],
            default: null // Set default to null in case there's no manager
        }
    ]);

    console.log(`Adding employee: ${firstName} ${lastName}, Role: ${roleName}, Manager Name: ${managerName || 'None'}...`);
    await employeeService.createEmployee(firstName, lastName, roleName, managerName);
    startApplication();  // Return to main menu
};


const updateEmployeeRole = async () => {
    const employees = employeeService.getEmployees();
    const roles = roleService.getRoles();
    const { employeeName, roleName } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeName',
            message: 'Select the Employee to update:',
            choices: [(await employees).map((employee) => `${employee.first_name} ${employee.last_name}`)]
        },
        {
            type: 'list',
            name: 'roleName',
            message: `Select the Employee's new role:`,
            choices: [(await roles).map((role) => role.title)]
        }
    ]);

    console.log(`Updating employee ${employeeName} to role ${roleName}...`);
    employeeService.updateEmployee(employeeName, roleName);
    startApplication();  // return to main menu
};

// start the application
startApplication();

