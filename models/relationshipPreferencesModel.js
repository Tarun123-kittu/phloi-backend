const mongoose = require('mongoose');

const relationshipPreferenceSchema = new mongoose.Schema({
  relationship_type: {
    type: String,
    required: [true, 'Relationship type is required'],
    unique: true, 
  },
  emoji:{type:String,default:null}
},{timestamps:true});

const RelationshipPreference = mongoose.model('relationship_preference', relationshipPreferenceSchema);
module.exports = RelationshipPreference;
