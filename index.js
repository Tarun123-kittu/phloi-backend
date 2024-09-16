const express = require('express');
const app = express();
const cors = require('cors')
const routes = require("./routes/routes")
const fileUpload = require('express-fileupload')
const { phloi_db_connection } = require("./config/config")


app.get('/', (req, res) => {
    res.send("phloii backend is working...");
});

app.use(cors())
app.use(cors({
    origin: '*'
}))
app.use(express.text())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(routes);


phloi_db_connection()

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
});


