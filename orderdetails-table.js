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

app.get('/orderdetails', (req, res) => {
    connection.query('SELECT * FROM `orderdetails`', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({ message: 'Success', rows: rows });
        }
    });
});

app.get('/orderdetails/:id', (req, res) => {
    connection.query('SELECT * FROM `orderdetails` WHERE OrderDetailID=?', [req.params.id], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (rows.length === 0) {
                res.status(404).send({ code: 404, message: 'Order detail not found' });
            } else {
                res.status(200).send({ message: 'Success', row: rows[0] });
            }
        }
    });
});

app.delete('/orderdetails/:id', (req, res) => {
    connection.query('DELETE FROM `orderdetails` WHERE OrderDetailID=?', [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({ code: 404, message: 'Order detail not found' });
            } else {
                res.status(200).send({ message: 'Success' });
            }
        }
    });
});

app.post('/orderdetails', (req, res) => {
    const orderDetail = req.body;

    // Validate each field to ensure it is not empty
    for (const field in orderDetail) {
        if (!orderDetail[field]) {
            res.status(400).send(`Please provide a value for ${field}`);
            return;
        }
    }

    // If all fields are provided, proceed with insertion
    const orderDetailData = [orderDetail.OrderDetailID, orderDetail.OrderID, orderDetail.ProductID, orderDetail.Quantity, orderDetail.Price];
    connection.query('INSERT INTO `orderdetails` (OrderDetailID, OrderID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?, ?)', orderDetailData, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({ message: 'Success' });
        }
    });
});

app.patch('/orderdetails/:id', (req, res) => {
    const orderDetailId = req.params.id;
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

    connection.query('UPDATE `orderdetails` SET ? WHERE OrderDetailID=?', [filteredUpdates, orderDetailId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({ code: 404, message: 'Order detail not found' });
            } else {
                res.status(200).send({ message: 'Success' });
            }
        }
    });
});

app.use((req, res) => {
    res.status(404).send('Error: Please Check The Path');
});

app.listen(3001, () => console.log("Server is running on port 3001"));
