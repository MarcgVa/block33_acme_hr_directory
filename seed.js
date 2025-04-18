require("dotenv").config();
const pg = require("pg");
const PORT = 3000;
const client = new pg.Client(process.env.DATABASE_URL);


const init = async () => {
  try {
    await client.connect();
    const SQL = `
      DROP TABLE IF EXISTS departments CASCADE;
        CREATE TABLE departments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100)
        );
        INSERT INTO departments(name) VALUES ('HR');
        INSERT INTO departments(name) VALUES ('Tech');
        INSERT INTO departments(name) VALUES ('Marketing');
        DROP TABLE IF EXISTS employees CASCADE;
        CREATE TABLE employees (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100),
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          department_id UUID REFERENCES departments(id) NOT NULL
        );
        INSERT INTO employees(name,department_id) VALUES ('Marc',(SELECT id FROM departments WHERE name='Tech'));
    `;
    await client.query(SQL);
    console.log("The database is seeded");
    await client.end();
  } catch (error) {
    console.error(error);
  }
};

init();