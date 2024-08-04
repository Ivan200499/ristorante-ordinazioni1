const express = require('express');
const fs = require('fs');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    const PORT = process.env.PORT || 3000;

    server.use(express.json());

    // Serve static files from the public directory
    server.use(express.static(path.join(__dirname, 'public')));

    // Endpoint per il menu
    server.get('/api/menu', (req, res) => {
        fs.readFile('menu.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Errore nella lettura del file menu.json:', err);
                return res.status(500).json({ error: 'Errore nella lettura del menu' });
            }
            res.json(JSON.parse(data));
        });
    });

    // Endpoint per gli ordini
    server.post('/api/orders', (req, res) => {
        fs.readFile('orders.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Errore nella lettura del file orders.json:', err);
                return res.status(500).json({ error: 'Errore nella lettura degli ordini' });
            }

            const orders = JSON.parse(data);
            const newOrder = req.body;
            orders.push(newOrder);

            fs.writeFile('orders.json', JSON.stringify(orders, null, 2), (err) => {
                if (err) {
                    console.error('Errore nella scrittura del file orders.json:', err);
                    return res.status(500).json({ error: 'Errore nel salvataggio dell\'ordine' });
                }
                res.status(201).json(newOrder);
            });
        });
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Server in ascolto su http://localhost:${PORT}`);
    });
});
