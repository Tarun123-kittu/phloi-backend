const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send("I am online");
});

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
});


