const connection = require("./connection");
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

function validateFields(fields) {
    for (const field in fields) {
        if (!fields[field]) {
            return `Please provide a value for ${field}`;
        }
    }
    return null; 
}

app.get('/order-table', (req, res) => {
    connection.query('SELECT * FROM `order-table`', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(rows);
        }
    });
});

app.get('/order-table/:id', (req, res) => {
    connection.query('SELECT * FROM `order-table` WHERE OrderID=?', [req.params.id], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (rows.length === 0) {
                res.status(404).send('Order not found');
            } else {
                res.send(rows[0]);
            }
        }
    });
});

app.delete('/order-table/:id', (req, res) => {
    connection.query('DELETE FROM `order-table` WHERE  OrderID=?', [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send('Order not found');
            } else {
                res.send('Order deleted successfully');
            }
        }
    });
});

app.post('/order-table', (req, res) => {
    const order = req.body;

    // Validate each field to ensure it is not empty
    for (const field in order) {
        if (!order[field]) {
            res.status(400).send(`Please provide a value for ${field}`);
            return;
        }
    }

    // If all fields are provided, proceed with insertion
    const orderData = [order.OrderID,order.id, order.OrderDate, order.TotalAmount, order.ShippingAddress, order.PaymentMethod,  order.OrderStatus];
    connection.query('INSERT INTO `order-table` (OrderID ,id, OrderDate, TotalAmount, ShippingAddress, PaymentMethod,  OrderStatus) VALUES (?, ?, ?, ?, ?, ?, ?)', orderData, (err, result) => {
     if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send('Order added successfully');
        }
    });
});


app.patch('/order-table/:id', (req, res) => {
    const orderId = req.params.id;
    const updates = req.body;
    const validationError = validateFields(updates);
    if (validationError) {
        res.status(400).send(validationError);
        return;
    }

    // Filter out any undefined or null values from the updates
    const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
            acc[key] = value;
        }
        return acc;
    }, {});

    connection.query('UPDATE `order-table` SET ? WHERE  OrderID=?', [filteredUpdates, orderId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send('Order not found');
            } else {
                res.send('Order updated successfully');
            }
        }
    });
});


app.use((req, res) => {
    res.status(404).send('Error: Please Check The Path');
});

app.listen(3001, () => console.log("Server is running on port 3001"));
