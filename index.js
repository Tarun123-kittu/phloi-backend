let express = require('express');
let app = express();
let cors = require('cors');
const fileUpload = require('express-fileupload')
let { phloi_db_connection } = require("./config/config");
let config = require('./config/config')
let path = require('path')
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const userModel = require('./models/userModel')
const joinedRoomsModel = require('./models/joinedRoomsModel')
const roomsModel = require('./models/exploreRoomsModel')



const io = socketIo(server, {
  cors: {
    transports: ['polling'],
    origin: "*",
  },
});

module.exports = { io: io };


io.on('connection', (socket) => {
  console.log("New client connected with socket ID ::", socket.id);



socket.on('disconnect', () => {
    console.log("Client disconnected with socket ID ::", socket.id);
  });


  socket.on('user_login', async (data) => {
    console.log('user login is confirmed ...', data)
    await userModel.findByIdAndUpdate(data.userId, {
    $set: { online_status: true }
    })
    io.emit('login', data.userId)
  })


  socket.on('user_logout', async (data) => {
    console.log('user logout is confirmed ...', data)
    let user = await userModel.findByIdAndUpdate(data.userId, {
    $set: { online_status: false }
    }, { new: true })

    if(user){

    if (user.room_joined == true) {

    let roomId = user.joined_room_id
    let userId = data.userId
    await joinedRoomsModel.findOneAndDelete({ userId: userId });
    await roomsModel.findByIdAndUpdate(roomId, {
    $inc: { joined_user_count: -1 },
    });

    await userModel.findByIdAndUpdate(userId, {
    $set: { room_joined: false , joined_room_id: null }
      });
    let joinedUserCount = await roomsModel.findById(roomId)
    let count = joinedUserCount.joined_user_count
    io.emit("room_left", { roomId, count });
    }
  
    io.emit('logout', data.userId)
  }
  })
});





app.use(cors())
app.use(cors({
  origin: '*',
}));

let hotelRoutes = require('./routes/hotelRoutes/routes')
app.use('/api/v1/hotel', hotelRoutes)


app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(express.static(__dirname + '/views'));


app.set('view engine', 'ejs')
app.set("views", __dirname + "/views")

app.use(express.static(path.join(__dirname, 'public')));


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
