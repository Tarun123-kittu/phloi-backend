let mongoose = require('mongoose')

let joinedRoomSchema = new mongoose.Schema({
  userId:{type:mongoose.Types.ObjectId},
  room_id:{type:mongoose.Types.ObjectId}
},{timestamps:true})

module.exports = mongoose.model('joined_rooms',joinedRoomSchema)