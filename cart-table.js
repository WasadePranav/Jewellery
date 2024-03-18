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

app.get('/cart-table', (req, res) => {
    connection.query('SELECT * FROM `cart-table`', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({ message: 'Success', rows: rows });
        }
    });
});

app.get('/cart-table/:id', (req, res) => {
    connection.query('SELECT * FROM `cart-table` WHERE CartID=?', [req.params.id], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (rows.length === 0) {
                res.status(404).send({ code: 404, message: 'Address not found' });
            } else {
                res.status(200).send({ message: 'Success', row: rows[0] });
            }
        }
    });
});

app.delete('/cart-table/:id', (req, res) => {
    connection.query('DELETE FROM `cart-table` WHERE CartID=?', [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({ code: 404, message: 'Address not found' });
            } else {
                res.status(200).send({ message: 'Success' });
            }
        }
    });
});

app.post('/cart-table', (req, res) => {
    const cartItem = req.body;

    // Validate each field to ensure it is not empty
    for (const field in cartItem) {
        if (!cartItem[field]) {
            res.status(400).send(`Please provide a value for ${field}`);
            return;
        }
    }

    // If all fields are provided, proceed with insertion
    const cartData = [cartItem.CartID,cartItem.UserID, cartItem.ProductID, cartItem.Quantity ,cartItem.CreatedAt ,cartItem.ModifiedAt ];
    connection.query('INSERT INTO `cart-table` (CartID , UserID, ProductID, Quantity,CreatedAt,ModifiedAt) VALUES (?, ?, ?)', cartData, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({ message: 'Success' });
        }
    });
});


app.patch('/cart-table/:id', (req, res) => {
    const cartItemId = req.params.id;
    const updates = req.body;
    const validationError = validateFields(updates);
    if (validationError) {
        res.status(400).send(validationError);
        return;
    }

  
    const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
            acc[key] = value;
        }
        return acc;
    }, {});

    connection.query('UPDATE `cart-table` SET ? WHERE CartID=?', [filteredUpdates, cartItemId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({ code: 404, message: 'Address not found' });
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
