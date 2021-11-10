const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function run ()
{
    try {

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