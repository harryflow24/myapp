// App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
//import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

const socket = io('http://localhost:3000'); // Ensure this URL is correct
//const stripePromise = loadStripe('your_stripe_public_key');

function App() {
    const [auctions, setAuctions] = useState([]);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Fetch auctions from the backend
        const fetchAuctions = async () => {
            const response = await axios.get('http://localhost:3000/auctions');
            setAuctions(response.data);
        };

        fetchAuctions();

        socket.on('new-bid', (auction) => {
            setAuctions(prevAuctions => prevAuctions.map(a => a.id === auction.id ? auction : a));
        });

        socket.on('auction-ended', (auction) => {
            setAuctions(prevAuctions => prevAuctions.filter(a => a.id !== auction.id));
        });
    }, []);

    const handleLogin = async (username, password) => {
        const response = await axios.post('http://localhost:3000/auth/login', { username, password });
        setToken(response.data.token);
    };

    const handleBid = async (auctionId, amount) => {
        await axios.post('http://localhost:3000/bid', { auctionId, amount }, {
            headers: { Authorization: token }
        });
    };

    return (
        <div>
            <h1>Astevip</h1>
            <LoginForm onLogin={handleLogin} />
            {auctions.map(auction => (
                <div key={auction.id}>
                    <h2>{auction.product}</h2>
                    <p>Ends in: {Math.max(0, (auction.endTime - Date.now()) / 1000)} seconds</p>
                    <ul>
                        {auction.bids.map((bid, index) => (
                            <li key={index}>{bid.user}: ${bid.amount}</li>
                        ))}
                    </ul>
                    <button onClick={() => handleBid(auction.id, 100)}>Bid $100</button>
                </div>
            ))}
            {/* <Elements stripe={stripePromise}>
                <CheckoutForm />
            </Elements> */}
        </div>
    );
}

function LoginForm({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button type="submit">Login</button>
        </form>
    );
}

export default App;