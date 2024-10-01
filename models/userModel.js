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
    sexual_orientation_preference_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'sexual_orientation' }],
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
    gender: { 
        type: String, 
        enum: [
          "women", 
          "men", 
          "Agender", 
          "Androgyne", 
          "Androgynous", 
          "Bigender", 
          "Female", 
          "Genderfluid", 
          "Gender Nonconforming", 
          "Genderqueer", 
          "Male", 
          "Neutrois", 
          "Non-binary", 
          "Other", 
          "Pangender", 
          "Trans", 
          "Trans Man", 
          "Trans Woman", 
          "Transfeminine", 
          "Transgender", 
          "Transmasculine", 
          "Two-Spirit"
        ] 
      },
    show_gender:{type:Boolean,default:true},
    study: { type: String, default: null },
    intrested_to_see: { type: String, enum: ['men', "women", "everyone"], default: 'everyone' },
    completed_steps: { type: Array, default: [] },
    current_step: { type: Number, default: 0 },
    room_joined:{type:Boolean,default:false},
    joined_room_id:{type:mongoose.Types.ObjectId,default:null},
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
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        },
    },
    setting: {
        distance_in: {
            type: String,
            default: "km",
            enum: ["km", "mi"]
        },
        read_receipts: {
            type: Boolean,
            default: true
        }
    },

    likedUsers: [{ type: mongoose.Schema.Types.ObjectId }],
    dislikedUsers: [{ type: mongoose.Schema.Types.ObjectId }],
 
    characteristics: UserCharactersticsSchema,
    preferences: UserPreferencesSchema,
    
    token :{type:String,default:null},
    online_status:{type:Boolean,default:true},
    show_sexual_orientation:{type:Boolean,default:true}
     
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
