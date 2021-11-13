const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/*------------------------------------------------
            Database connection string
--------------------------------------------------*/
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iganj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run ()
{
    try {
        /*------------------------------------------------
                Established database connection
        --------------------------------------------------*/
        await client.connect();
        const database = client.db('water-drops');
        const productsCollect = database.collection('products');
        const usersCollect = database.collection('users');
        const reviewsCollect = database.collection('reviews');
        const ordersCollect = database.collection('orders');

        /*------------------------------------------------
                Products data get, post and delete API
        --------------------------------------------------*/
        app.get('/products', async (req, res) =>
        {
            const cursor = productsCollect.find({});
            const size = parseInt(req.query.size);
            let products;
            if (size) {
                products = await cursor.limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }
            res.send(products);
        });

        app.get('/products/:id', async (req, res) =>
        {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollect.findOne(query);
            res.send(result);
        });

        app.post('/products', async (req, res) =>
        {
            const product = req.body;
            const result = await productsCollect.insertOne(product);
            res.json(result);
        });

        app.delete('/products/:id', async (req, res) =>
        {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollect.deleteOne(query);
            res.json(result);
        });

        /*------------------------------------------------
                Reviews data get and post API
        --------------------------------------------------*/
        app.post('/reviews', async (req, res) =>
        {
            const review = req.body;
            const result = await reviewsCollect.insertOne(review);
            res.json(result);
        });

        app.get('/reviews', async (req, res) =>
        {
            const cursor = reviewsCollect.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        /*------------------------------------------------
            Orders data get, post, put and delete API
        --------------------------------------------------*/
        app.post('/orders', async (req, res) =>
        {
            const newOrder = req.body;
            const result = await ordersCollect.insertOne(newOrder);
            res.json(result);
        });

        app.get('/orders', async (req, res) =>
        {
            const cursor = ordersCollect.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        app.put('/orders/:id', async (req, res) =>
        {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    orderStatus: updateStatus.orderStatus
                }
            };
            const result = await ordersCollect.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.delete('/orders/:id', async (req, res) =>
        {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollect.deleteOne(query);
            res.json(result);
        });

        app.get('/orders/:email', async (req, res) =>
        {
            const email = req.params.email;
            const query = { email: { $eq: email } };
            const cursor = ordersCollect.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        /*------------------------------------------------
                Users data get, post and Admin put API
        --------------------------------------------------*/
        app.post('/users', async (req, res) =>
        {
            const user = req.body;
            const result = await usersCollect.insertOne(user);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) =>
        {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollect.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            };
            res.json({ admin: isAdmin });
        });

        app.put('/users/admin', async (req, res) =>
        {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: { role: 'admin' }
            };
            const result = await usersCollect.updateOne(filter, updateDoc);
            res.json(result);
        });
    }
    finally {
        //await client.close();
    }
};

run().catch(console.dir);

app.get('/', (req, res) =>
{
    res.send('Water Drops Server')
});

app.listen(port, () =>
{
    console.log('Server running at port', port)
});