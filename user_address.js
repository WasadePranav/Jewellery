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

app.get('/users-address', (req, res) => {
    connection.query('SELECT * FROM `users-address`', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({message: ' Success', rows: rows,  });
        }
    });
});

app.get('/users-address/:id', (req, res) => {
    connection.query('SELECT * FROM `users-address` WHERE UserID=?', [req.params.id], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (rows.length === 0) {
                res.status(404).send({code:404,message:" {Address not found}"});
            } else {
                res.status(200).send({ message: 'Success', row: rows[0] });
            }
        }
    });
});

app.delete('/users-address/:id', (req, res) => {
    connection.query('DELETE FROM `users-address` WHERE UserID=?', [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({code:404,message:" {Address not found}"});
            } else {
                res.status(200).send({message: 'Success'});
            }
        }
    });
});

app.post('/users-address', (req, res) => {
    const emp = req.body;

    // Validate each field to ensure it is not empty
    for (const field in emp) {
        if (!emp[field]) {
            res.status(400).send(`Please provide a value for ${field}`);
            return;
        }
    }

    // If all fields are provided, proceed with insertion
    const empData = [emp.UserID, emp.FirstName, emp.LastName, emp.Email, emp.Address, emp.Phone, emp.Country, emp.City, emp.Pincode, emp.State];
    connection.query('INSERT INTO `users-address` (UserID, FirstName, LastName, Email, Address, Phone, Country, City, Pincode, State) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', empData, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send({message: 'Success'});
        }
    });
});


app.patch('/users-address/:id', (req, res) => {
    const addressId = req.params.id;
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

    connection.query('UPDATE `users-address` SET ? WHERE UserID=?', [filteredUpdates, addressId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send({code:404,message:" {Address not found}"});
            } else {
                res.status(200).send('Address updated successfully');
            }
        }
    });
});


app.use((req, res) => {
    res.status(404).send('Error: Please Check The Path');
});

app.listen(3001, () => console.log("Server is running on port 3001"));
