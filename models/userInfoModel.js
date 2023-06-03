const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};

const userInfoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String, 
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validateEmail, 'Please fill in a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Please fill in a valid password'],
  },
  key: {
    type: String, 
    required: true
  },
  passwordRecoveryCode: {
    type: String,
    expires: 1800
  },
  ownedMapCards: {
    type: [Schema.Types.ObjectId],
    required: true
  }, 
  blockedUsers: {
    type: [Schema.Types.ObjectId], 
    required: true
  }, 
  usersFollowing: {
    type: [Schema.Types.ObjectId], 
    required: true
  }
});

module.exports = mongoose.model("userInfoSchema", userInfoSchema);