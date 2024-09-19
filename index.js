const express = require('express');
const app = express();
const cors = require('cors')
const routes = require("./routes/routes")
const fileUpload = require('express-fileupload')
const { phloi_db_connection } = require("./config/config")
const http = require('http')
const socketIo = require('socket.io')
const server = http.createServer(app);


const io = socketIo(server, {
    cors: {
        transports: ['polling'],
        origin: "*"
    },
});

module.exports = {
    io:io
};

io.on('connection', (socket) => {
    console.log("New client connected and id is ::", socket.id);
})

io.on("disconnect", (socket) => {
    console.log("disconnect and socket id is::", socket.id)
})


app.use(cors())
app.use(cors({
    origin: '*',
}));
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(routes);


app.get('/', (req, res) => {
    res.send("phloii backend is working...");
});



phloi_db_connection()

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
});


