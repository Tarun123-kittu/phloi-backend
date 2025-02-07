let mongoose = require('mongoose')

let eventsSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId ,ref: 'Hotel'},
    eventTitle: { type: String },
    eventStart: {
        date: { type: Date },
        time: { type: String }
    },
    eventEnd: {
        date: { type: Date },
        time: { type: String }
    },
    eventDescription: { type: String },
    image: { type: String }
},{timestamps:true})

module.exports = mongoose.model('event',eventsSchema)