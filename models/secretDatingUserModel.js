let mongoose = require('mongoose')

let secretDatingUserSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, default: null },
    avatar: { type: String, default: null },
    profile_image: { type: String, default: null },
    bio: { type: String, default: null },
    interested_to_see: { type: String, enum: ['men', 'women', 'everyone'], default: 'everyone' },
    sexual_orientation_preference_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Options' }],
    show_sexual_orientation: { type: Boolean, default: true },
    relationship_preference: { type: mongoose.Schema.Types.ObjectId, ref: 'Options' },
    likedUsers: [{ type: mongoose.Schema.Types.ObjectId }],
    dislikedUsers: [{ type: mongoose.Schema.Types.ObjectId }],
    current_step:{type:Number,default:0},
    completed_steps: { type: Array, default: [] },
}, { timestamps: true })

module.exports = mongoose.model('secret_dating_users', secretDatingUserSchema)