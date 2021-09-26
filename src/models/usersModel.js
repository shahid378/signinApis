//const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//create schema for users documents
const userSchema = new mongoose.Schema({
    name: {
        type: 'string',
        required: true,
        trim: true,
    },
    email: {
        type: 'string',
        required: true,
        unique: true,
        validate(val){
            if(!validator.isEmail(val)) throw new Error('email is invalid');
        }
    },
    password: {
        type: 'string',
        required: true,
        minLength: 4,
        validate(val) {
            if(val.toLowerCase()=='password') throw new Error('password can not be password');
        }
    },
    age: {
        type: Number,
        validate(val) {
            if (val==0 || val<0) {
                throw new Error('age can not be zero')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
    
})

//mongoose middleware to perform before some action , here before save
//to encrypt passsword
userSchema.pre('save', function (next) {
    const user = this;
    //user.password = bcrypt.hashSync(user.password, 4)
    if (user.isModified('password')) {
        user.password = bcrypt.hashSync(user.password, 4)
    }
    next();
});

//to create tokens
const JWT_SECRET = 'secret';
userSchema.methods.generateAuthenticationToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
    user.tokens = [...user.tokens, { token }];
    await user.save();
    return token;
}

//create model(collection ) for userSchema(row/documents)

const User =new mongoose.model('users', userSchema);

module.exports=User;