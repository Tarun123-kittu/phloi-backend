const mongoose = require('mongoose');


const UserCharactersticsSchema = new mongoose.Schema({
    communication_style_id: { type: mongoose.Schema.Types.ObjectId, ref: 'communication_style' },
    love_receive_id: { type: mongoose.Schema.Types.ObjectId, ref: 'love_receive' },
    drink_frequency_id: { type: mongoose.Schema.Types.ObjectId, ref: 'drink_frequency' },
    smoke_frequency_id: { type: mongoose.Schema.Types.ObjectId, ref: 'smoke_frequency' },
    workout_frequency_id: { type: mongoose.Schema.Types.ObjectId, ref: 'workout_frequency' },
    interests_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interests' }],
});


const UserPreferencesSchema = new mongoose.Schema({
    sexual_orientation_preference_id: { type: mongoose.Schema.Types.ObjectId, ref: 'sexual_orientation' },
    relationship_type_preference_id: { type: mongoose.Schema.Types.ObjectId, ref: 'relationship_preference' },
    distance_preference: { type: Number, default: 0 }
});


const userSchema = new mongoose.Schema({    
    username: { type: String, default: null },
    mobile_number: { type: Number, default: null },
    email: { type: String, default: null },
    otp: { type: String, default: null },
    otp_sent_at: { type: Date, default: null },
    dob: { type: Date, default: null },
    gender: { type: String, enum: ["women", "men", "other"] },
    study: { type: String, default: null },
    intrested_to_see: { type: String, enum: ['men', "women", "everyone"], default: 'everyone' },
    completed_steps: { type: Array, default: [] },
    current_step: { type: Number, default: 0 },
    socialLogin: [
        {
            providerName: { type: String, enum: ["google", "apple", "facebook"] },
            providerId: { type: String, default: null }
        },
    ],
    images: [
        {
          url: String,
          position: Number,  
        }
      ],


      
    characteristics: UserCharactersticsSchema,
    preferences: UserPreferencesSchema,
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        },
    },

}, { timestamps: true });


const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
