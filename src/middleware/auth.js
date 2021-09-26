const jwt = require('jsonwebtoken');
const User = require('../models/usersModel');

const JWT_SECRET = 'secret';

//when user gets loggin then token is generated and then
//we use that token to find userid to match the data base
//so user can perform actions only on his profile
//such as logout or delete his profile
//to do this a auth function is passed to request method as a middleware
//to inspect

const auth = async (req, res, next) => {
    try {
        //token is filtered removing extra header info
        const token = req.header('Authorization').replace('Bearer ', '');
        
        //jwt.verify verifys token with aecret key then return the id of user
        const decoded = jwt.verify(token, JWT_SECRET);
        //console.log(decoded);

        //find the user by using id and token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            return res.status(400).send('Bad Request!');
        }

        //now add user data in request by adding user in req object
        req.user = user;

        //add token to req object also
        req.token = token;

        //this will imply to use next function in request method
        next();
    } catch (e) {
        console.log(e);
        return res.status(500).send('Error occured');
    }
}

module.exports = auth;