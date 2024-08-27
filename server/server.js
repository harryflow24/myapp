// server.js
const express = require('express');
const cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { router: authRouter, authenticateToken } = require('./auth');
const paymentRouter = require('./payment');

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());
app.use('/auth', authRouter);
app.use('/payment', paymentRouter);

let auctions = [];

// Endpoint to fetch all auctions
app.get('/auctions', (req, res) => {
    res.status(200).send(auctions);
});

// Endpoint per creare un'asta (protetto)
app.post('/create-auction', authenticateToken, (req, res) => {
    const auction = {
        id: auctions.length + 1,
        product: req.body.product,
        endTime: Date.now() + 8000,
        bids: []
    };
    auctions.push(auction);
    res.status(201).send(auction);
});

// server.js
app.post('/create-test-auction', (req, res) => {
    const auction = {
        id: auctions.length + 1,
        product: req.body.product || 'Test Product',
        endTime: Date.now() + 8000,
        bids: []
    };
    auctions.push(auction);
    res.status(201).send(auction);
});

// Endpoint per fare un'offerta (protetto)
app.post('/bid', authenticateToken, (req, res) => {
    const auction = auctions.find(a => a.id === req.body.auctionId);
    if (auction) {
        auction.bids.push({ user: req.user.id, amount: req.body.amount });
        io.emit('new-bid', auction);
        res.status(200).send(auction);
    } else {
        res.status(404).send({ message: 'Auction not found' });
    }
});

// Timer per gestire le aste
setInterval(() => {
    const now = Date.now();
    auctions.forEach(auction => {
        if (auction.endTime <= now) {
            io.emit('auction-ended', auction);
            auctions = auctions.filter(a => a.id !== auction.id);
        }
    });
}, 1000);

http.listen(3000, () => {
    console.log('Server is running on port 3000');
});