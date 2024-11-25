let express = require('express');
let app = express();
let cors = require('cors');
const fileUpload = require('express-fileupload')
let { phloi_db_connection } = require("./config/config");
let config = require('./config/config')
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const userModel = require('./models/userModel')
const joinedRoomsModel = require('./models/joinedRoomsModel')



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


  socket.on('user_login', async (data) => {
    console.log('user login is confirmed ...', data)
    await userModel.findByIdAndUpdate(data.userId, {
      $set: {
        online_status: true
      }
    })
    io.emit('login', data.userId)
  })


  socket.on('user_logout', async (data) => {
    console.log('user logout is confirmed ...', data)
    let user = await userModel.findByIdAndUpdate(data.userId, {
      $set: {
        online_status: false
      }
    }, { new: true })
    if (user.room_joined == true) {
      let userRoom = await joinedRoomsModel.findOneAndDelete({ userId: data.userId });
    }
    io.emit('logout', data.userId)

  })

});





app.use(cors())
app.use(cors({
  origin: '*',
}));
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())

let appRoutes = require('./routes/appRoutes/routes');
app.use('/api/v1', appRoutes);

let adminRoutes = require('./routes/adminRoutes/routes')
app.use('/api/v1', adminRoutes)


phloi_db_connection();


app.get('/api/v1/test_phloii', (req, res) => {
  res.send("phloii backend is working...");
});


const PORT = config.development.port || 8000;
server.listen(PORT, () => {
  console.log(`App is listening on PORT ${PORT}`);
});
