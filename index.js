require("dotenv").config();
const express = require("express");
const app = express();
const pg = require("pg");
const cors = require("cors");
const PORT = process.env.SERVER_PORT || 3000;
const pool = require("./database");


//MIDDLEWARE
app.use(cors());
app.use(express.json());


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


// GET all departments
app.get("/api/departments", async (req, res) => {
  try {
    const sql = "SELECT * FROM departments";
    const departments = await pool.query(sql);
    res.status(200).json(departments.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
});

// GET all employees
app.get("/api/employees", async (req, res) => {
  try {
    const sql = "SELECT * FROM employees";
    const employees = await pool.query(sql);
    res.status(200).json(employees.rows);
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
});

//GET employee by id --- not on rubric -- just practice
app.get("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM employees WHERE id = $1";
    const flavor = await pool.query(sql, [id]);
    res.status(200).json(flavor.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
});

app.post("/api/employees", async (req, res, next) => {
  try {
    const { name, department_id } = req.body;
    const sql = `INSERT INTO employees (name, department_id) VALUES ($1, (SELECT id FROM departments WHERE name=$2)) RETURNING *`;
    const response = await pool.query(sql, [name, department_id]);
    res.status(201).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
app.post("/api/departments", async (req, res, next) => { 
  try {
    const { name } = req.body;
    const sql = "INSERT INTO departments(name) VALUES ($1)";
    const response = await pool.query(sql, [name]);
    res.status(200).send(response.rows[0]);
  } catch (error) { 
    console.log(error.message);
    res.status(400).send(error);
  }

 });

app.delete("/api/employees/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM employees WHERE id = $1";
    const response = await pool.query(sql, [id]);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.put("/api/employees/:id", async (req, res, next) => {
  try {
    let response = "";
    const { id } = req.params;
    const { name, department_id } = req.body;

    if (name && department_id) {
      const sql =
        "UPDATE employees SET name = $1, department_id = (SELECT id FROM departments WHERE name=$2) WHERE id = $3";
      response = await pool.query(sql, [name, department_id, id]);
    }

    if (name && !department_id) {
      const sql = "UPDATE employees SET name = $1 WHERE id = $2";
      response = await pool.query(sql, [name, id]);
    }

    if (!name && department_id) {
      const sql =
        "UPDATE employees SET department_id = (SELECT id FROM departments WHERE name=$1) WHERE id = $2";
      response = await pool.query(sql, [department_id, id]);
    }
    res.send(200).send(response.rows[0]);
  } catch (error) {
    console.error(error);
    next(error);
  }
});