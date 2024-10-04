const mongoose = require('mongoose');


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
          "other"
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
    token :{type:String,default:null},
    online_status:{type:Boolean,default:true},

    sexual_orientation_preference_id:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Options' }],
    show_sexual_orientation:{type:Boolean,default:true},
    relationship_type_preference_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Options' },
    distance_preference: { type: Number, default: 0 },
    
    user_characterstics: {
      step_11: [{
        questionId: mongoose.Schema.Types.ObjectId,  
        answerId: mongoose.Schema.Types.ObjectId
      }],
      step_12: [{
        questionId: mongoose.Schema.Types.ObjectId,  
        answerId: mongoose.Schema.Types.ObjectId  
      }],
      step_13: [{
        questionId: mongoose.Schema.Types.ObjectId,  
        answerIds: [mongoose.Schema.Types.ObjectId]  
      }]
    }
     
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
