// auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

const users = []; // Array per memorizzare gli utenti

// Registrazione
router.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { id: users.length + 1, username: req.body.username, password: hashedPassword };
    users.push(user);
    res.status(201).send({ message: 'User registered' });
});

// Login
router.post('/login', async (req, res) => {
    const user = users.find(u => u.username === req.body.username);
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });
        res.status(200).send({ token });
    } else {
        res.status(401).send({ message: 'Invalid credentials' });
    }
});

// Middleware per autenticazione
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send({ message: 'Access denied' });

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) return res.status(403).send({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

module.exports = { router, authenticateToken };