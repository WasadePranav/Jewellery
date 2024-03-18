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

app.get('/category-table', (req, res) => {
    connection.query('SELECT * FROM `category-table`', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({ message: 'Success', rows: rows });
        }
    });
});

app.get('/category-table/:id', (req, res) => {
    connection.query('SELECT * FROM `category-table` WHERE CategoryID=?', [req.params.id], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (rows.length === 0) {
                res.status(404).send({ code: 404, message: 'Category not found' });
            } else {
                res.status(200).send({ message: 'Success', row: rows[0] });
            }
        }
    });
});

app.delete('/category-table/:id', (req, res) => {
    connection.query('DELETE FROM `category-table` WHERE CategoryID=?', [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({ code: 404, message: 'Category not found' });
            } else {
                res.status(200).send({ message: 'Success' });
            }
        }
    });
});

app.post('/category-table', (req, res) => {
    const category = req.body;

    // Validate each field to ensure it is not empty
    for (const field in category) {
        if (!category[field]) {
            res.status(400).send(`Please provide a value for ${field}`);
            return;
        }
    }

    // If all fields are provided, proceed with insertion
    const categoryData = [category.CategoryID, category.CategoryName, category.Description];
    connection.query('INSERT INTO `category-table` (CategoryID, CategoryName, Description) VALUES (?, ?, ?)', categoryData, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({ message: 'Success' });
        }
    });
});


app.patch('/category-table/:id', (req, res) => {
    const categoryId = req.params.id;
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

    connection.query('UPDATE `category-table` SET ? WHERE CategoryID=?', [filteredUpdates, categoryId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({ code: 404, message: 'Category not found' });
            } else {
                res.status(200).send({ message: 'Category updated successfully' });
            }
        }
    });
});


app.use((req, res) => {
    res.status(404).send('Error: Please Check The Path');
});

app.listen(3001, () => console.log("Server is running on port 3001"));
