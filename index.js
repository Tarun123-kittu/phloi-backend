const express = require('express');
const app = express();
const { phloi_db_connection } = require("./config/config")

app.get('/', (req, res) => {
    res.send("I am online");
});

phloi_db_connection()

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
});
