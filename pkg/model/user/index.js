const mongoose = require('mongoose');

const User = mongoose.model('users', 
{
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    age: {type: Number, required: true},
    role: {type: String, default: 'basic', enum: ['basic', 'admin']},
    accessToken: {type: String}
}, 
'users'
);

module.exports = User;

