'use strict';
// Pool dependencies to connect to database
const { Pool } = require('pg')
const pool = new Pool({
    user: 'postgres',
    password: 'password',
    host: 'localhost',
    database: 'orders-db',
    port: 6432,
  })
// Express dependencies 
const express = require('express');
const app = express();
// Morgan middleware
const morgan = require('morgan');
app.use(morgan('short'));
// Body Parser middleware
const bodyParser = require('body-parser');
const { json } = require('body-parser');
app.use(bodyParser.json());
// GET request to /customers
// returns all customers
app.get("/api/:table", (req, res, next)=>{
    const table = req.params.table;
    console.log(typeof table)
    if(table === 'customers' || table ==='orders') {
        console.log('true')
         pool.query(`SELECT * FROM ${table}`, (err, result)=>{
            console.log(result)
            if(err){
                return next(err)
            }
        
        const customerRows = result.rows
        res.send(customerRows)
    })

    } else {
        return res.status(404).send('There are no tables with the name ' + table)
    }
})

app.get("/api/:table/:id", (req, res, next)=>{
    console.log(req.params)
    const table = req.params.table
    const id = Number.parseInt(req.params.id)
    console.log("table: " + table, "id: " + id)
    if(table === 'customers' || table ==='orders') {
        
        pool.query(`SELECT * FROM ${table} WHERE ${table}_id = $1`,[id], (err, result)=>{
            if(err){
                return next(err)
            }
            const tableRow = result.rows[0]
            
            if(tableRow){
                return res.send(tableRow)  
            } else{
                res.status(404).send("No data to display")
            }
        })
    }
})

app.post("/api/:table", (req, res, next)=>{
    //add data from post request body to the table
    const table = req.params.table
    //log request body
    if(table === "customers"){
       const customerId = Number.parseInt(req.body.table);
       const {email, city} = req.body
       console.log(customerId, email, city)
    } else if(table === "orders"){
        const orderId = req.body.customer_id
        const {number_of_items, order_date} = req.body
        if(orderId && order_date && number_of_items && !Number.isNaN(orderId)){
            pool.query(`INSERT INTO ${table} ("order_date", "number_of_items", "customer_id") VALUES ($1, $2, $3) RETURNING *`, [order_date, number_of_items, orderId] , (err, result)=>{
                let order = result.rows[0]
                console.log(order)
                if(order){
                    res.send(order)
                } else{
                    return next(err)
                }
                
            })
        }else {
            return res.status(400).send("Unable to create order from request body")
        }
    } else {
        res.status(404).send('There are no tables with the name ' + table)
    }

    
    
    // Have to add the foreign key as well
})






// listen on port 8000
const port = process.env.PORT || 8000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', port);
});
module.exports = app;