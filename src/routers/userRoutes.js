const express = require('express');

//bcrypt for comparing password
const bcrypt = require('bcrypt');

//middleware to authenticate users
const auth= require('../middleware/auth');

//connect all routes to db
require('../db/connection')

//import model User
const User = require('../models/usersModel')

//use express router to write apis
const router = express.Router();

//now write all apis

//api to sign in user
router.post('/signin', async (req, res) => {
    try {
        const userData = new User(req.body);
        //console.log(userData);
        const user = await userData.save();
        const token = await user.generateAuthenticationToken();
        res.status(201).send({user, token});
        console.log("request successful")
    }
    catch (e) {
        res.status(500).send(e);
        console.log(e);
    }
})

//api to login user basically to get user's data
router.get('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.find({ email: email });
        const matchPass = await bcrypt.compare(password, user[0].password)
        console.log(matchPass);
        if (matchPass) {
            const userob = user[0];
            console.log(userob);
            const token = await userob.generateAuthenticationToken();
            res.status(200).send(userob);
        }
        else {
            res.status(500).send("invalid credentials");
            console.log('request failed');
        }
    }
    catch (e) {
        res.send(e).status(500);
    }
})

//api to sing out/delete user
router.delete('/user/delete/:id',auth, async (req, res) => {
    try {
        console.log(req.param);
        const user = await User.findOneAndRemove({ _id: req.params.id })
        console.log(user);
        res.status(500).send(user);
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }

})

//update the user userData

router.patch('/update/:id',auth, async (req, res) => {
    try {
        const newupdate = req.body;
        const user = await User.findOneAndUpdate({ _id: req.params.id }, newupdate, { new: true })
        res.status(200).send(user);
        console.log('updated');
    }
    catch (err) {
        res.send(err);
    }

})

//logout user

router.post('/logout', auth, async (req, res) => {

    //after auth give user in req.user object check for
    //that single token with all token in user
    //then filter out that token 
    req.user.tokens = req.user.tokens.filter((t) => {
        return t.token != req.token;
    });

    //after filtering out that token save the filtered user
    await req.user.save();
    res.status(200).send('User Logged out!');
});

//logout user from all devices by deleting all token using above method
router.post('/logoutAll', auth, async (req, res) => {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send('User Logged out from everywhere!');
});

//now send this router to index to use this
module.exports = router;
