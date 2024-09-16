const mongoose = require('mongoose');

const relationshipPreferenceSchema = new mongoose.Schema({
  relationship_type: {
    type: String,
    required: [true, 'Relationship type is required'],
    unique: true, 
  },
},{timestamps:true});

const RelationshipPreference = mongoose.model('relationship_preference', relationshipPreferenceSchema);
module.exports = RelationshipPreference;
