let express = require('express');
let app = express();
let cors = require('cors');
const fileUpload = require('express-fileupload')
let { phloi_db_connection } = require("./config/config");
let config = require('./config/config')
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);



const io = socketIo(server, {
  cors: {
    transports: ['polling'],  
    origin: "*",             
  },
});

module.exports = {
  io: io
};


io.on('connection', (socket) => {
  console.log("New client connected with socket ID ::", socket.id);


  socket.on('disconnect', () => {
    console.log("Client disconnected with socket ID ::", socket.id);
  });
});


app.use(cors())
app.use(cors({
    origin: '*',
}));
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())

let routes = require('./routes/routes');
app.use('/api/v1',routes);  


phloi_db_connection();


app.get('/test_phloii', (req, res) => {
  res.send("phloii backend is working...");
});


const PORT = config.development.port || 8000;  
server.listen(PORT, () => {
  console.log(`App is listening on PORT ${PORT}`);
});
