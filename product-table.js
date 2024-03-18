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

app.get('/products-table', (req, res) => {
    connection.query('SELECT * FROM `products-table`', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({ message: 'Success', rows: rows });
        }
    });
});

app.get('/products-table/:id', (req, res) => {
    connection.query('SELECT * FROM `products-table` WHERE ProductID=?', [req.params.id], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (rows.length === 0) {
                res.status(404).send({ code: 404, message: 'Product not found' });
            } else {
                res.status(200).send({ message: 'Success', row: rows[0] });
            }
        }
    });
});

app.delete('/products-table/:id', (req, res) => {
    connection.query('DELETE FROM `products-table` WHERE ProductID=?', [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({ code: 404, message: 'Product not found' });
            } else {
                res.status(200).send({ message: 'Success' });
            }
        }
    });
});

app.post('/products-table', (req, res) => {
    const product = req.body;

    // Validate each field to ensure it is not empty
    const validationError = validateFields(product);
    if (validationError) {
        res.status(400).send(validationError);
        return;
    }

    // If all fields are provided, proceed with insertion
    const productData = [product.ProductID, product.Name, product.Description, product.Price, product.CategoryID, product.Quantity, product.Instock, product.CreatedAt, product.ModifiedAt,];
    connection.query('INSERT INTO `products-table` (ProductID, Name, Description, Price, CategoryID, Quantity, Instock ,CreatedAt, ModifiedAt) VALUES (?, ?, ?, ?, ?, ?,?,?)', productData, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({ message: 'Success' });
        }
    });
});

app.patch('/products-table/:id', (req, res) => {
    const productId = req.params.id;
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

    connection.query('UPDATE `products-table` SET ? WHERE ProductID=?', [filteredUpdates, productId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({ code: 404, message: 'Product not found' });
            } else {
                res.status(200).send({ message: 'Product updated successfully' });
            }
        }
    });
});

app.use((req, res) => {
    res.status(404).send('Error: Please Check The Path');
});

app.listen(3001, () => console.log("Server is running on port 3001"));
