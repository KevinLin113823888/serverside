const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const userInfoSchema = require("../models/userInfoModel");
const MapCard = require('../models/mapCardModel');
const MapData = require('../models/mapDataModel');
const auth = require('../auth');

const isCookieSecure = process.env.NODE_ENV === "production" ? true : false;
const sameSiteCookie = process.env.NODE_ENV === "production" ? "none" : "lax";

const transporter = nodemailer.createTransport({
    service : process.env.EMAIL_SERVICE,
    auth : {
        user : process.env.EMAIL_USERNAME,
        pass : process.env.EMAIL_PASSWORD
    }
});

class userController {
    static async getLoggedIn(req, res) {
        try{
            let userId = auth.verifyUser(req);
            if (!userId) {
                return res.status(200).json({
                    loggedIn: false,
                    user: null,
                    errorMessage: "Not logged in"
                })
            }
            let username = req.cookies.values.username;

            var user = await userInfoSchema.findOne({username: username});
            var mapCards = {};
            if(user)
                mapCards = await MapCard.find({ _id: { $in: user.ownedMapCards } });

            return res.status(200).json({status: 'OK', username: username, mapcards: mapCards.reverse()});
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({status: "ERROR", error: true, message: e.toString() });
        }
    }

    static async register(req, res) {
        try{
            var { name, username, email, password } = req.body;
            var user = await userInfoSchema.findOne({email});

            var key = makeKey();
            var hashpswd = await bcrypt.hash(password, 9);
            var user = new userInfoSchema({
                name,
                username,
                email,
                password: hashpswd,
                key: key,
                ownedMaps: [],
                ownedMapCards: [],
                blockedUsers: [],
                usersFollowing: []
            });
            await user.save();

            const token = auth.signToken(user._id);

            res.cookie('values', { username: user.username, token: token }, {
                httpOnly: isCookieSecure,
                secure: isCookieSecure,
                sameSite: sameSiteCookie,
            }).json({status: 'OK', name: user.name});
        }
        catch (e){
            console.log(e.toString());
            if (!user)
                return res.status(400).json({ status: "ERROR", error: true, message: "User is empty in the request body" });
            return res.status(400).json({status: "ERROR", error: true, message: e.toString() });
        }
    }

    static async login(req, res) {
        try{
            var { username, password } = req.body;

            var user = await userInfoSchema.findOne({username : username});
            if(!user)
                throw new Error("Please fill in a valid username")
            var isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch)
                throw new Error("Please fill in a valid password")
            const token = auth.signToken(user._id);
            
            res.cookie('values', { username: user.username, token: token }, {
                httpOnly: isCookieSecure,
                secure: isCookieSecure,
                sameSite: sameSiteCookie,
            }).json({status: 'OK', name: user.name});
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({status: "ERROR", error: true, message: e.toString()});
        }
    }

    static async logout(req, res, next) {
        try{
            res.clearCookie('values', {
                httpOnly: isCookieSecure,
                secure: isCookieSecure,
                sameSite: sameSiteCookie,
            });
            return res.json({status: 'ok'});
        }catch (e){
            console.log(e)
            return res.status(400).clearCookie("values").json({status: e.toString()});
        }
    }

    static async forgotUsername(req, res) {
        try{
            var { email } = req.body;
            console.log("email", email);

            var emailUser = await userInfoSchema.findOne({email});
            if(emailUser === null){
                throw new Error("email is null or is not valid");
            }

            let text = "Here is the password for email address " + email + ": " + emailUser.username;

            const options = {
                from : process.env.EMAIL_USERNAME, 
                to: email, 
                subject: "Username Recovery", 
                text: text,
            }

            transporter.sendMail(options, (error, info) =>{
                if(error) console.log(error)
                else console.log(info)
            })

            return res.status(200).json({status: 'OK'});
        }catch(e){
            return res.status(400).json({status: "ERROR", error: true, message: e.toString()});
        }
    }

    static async sendPasswordRecoveryCode(req, res) {
        try{
            var { email } = req.body;
            var emailUser = await userInfoSchema.findOne({email});
            if(emailUser === null){
                throw new Error("Email is does not exist or is wrong")
            }

            let passwordRecoveryCode = makeKey()
            let user = await userInfoSchema.findOneAndUpdate({email: email},{
                passwordRecoveryCode: passwordRecoveryCode
            });
            await user.save();

            let text = "Password Recovery Code: " + passwordRecoveryCode;

            const options = {
                from : process.env.EMAIL_USERNAME, 
                to: email, 
                subject: "Password Recovery", 
                text: text,
            }

            transporter.sendMail(options, (error, info) =>{
                if(error) console.log(error)
                else console.log(info)
            })

            return res.status(200).json({status: 'OK'});
        }catch(e){
            console.log(e.toString());
            return res.status(400).json({status: "ERROR", error: true, message: e.toString()});
        }
    }

    static async changePassword(req, res) {
        try{
            var { email, passwordRecoveryCode, password } = req.body;
            var emailUser = await userInfoSchema.findOne({email});

            if(emailUser.passwordRecoveryCode !== passwordRecoveryCode){
                throw new Error("Invalid Password Recovery Code")
            }
            var hashpswd = await bcrypt.hash(password, 9);

            await userInfoSchema.updateOne({email},{
                password: hashpswd
            })

            return res.status(200).json({status: 'OK'});
        }catch(e){
            return res.status(400).json({ status: "ERROR", error: true, message: e.toString()});
        }
    }

    static async changeUsername(req, res) {
        try{
            var { email, password, newUsername } = req.body;

            var emailUser = await userInfoSchema.findOne({email: email});
            if(!emailUser)
                throw new Error ("Invalid email")
            var isMatch = await bcrypt.compare(password, emailUser.password);
            if(!isMatch)
                throw new Error("Invalid password")

            var user = await userInfoSchema.findOneAndUpdate({email: email}, { username: newUsername });
            await user.save();
    
            return res.status(200).json({status: 'OK'});
        }catch(e){
            return res.status(400).json({status: "ERROR", error: true, message: e.toString()});
        }
    }

    static async deleteUser(req, res) {
        try{
            var { password } = req.body;
            let username = req.cookies.values.username;
            var user = await userInfoSchema.findOne({username: username});

            var isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch)
                throw new Error("Invalid password")
            
            let mapCards = await MapCard.find({_id:{$in:user.ownedMapCards}});

            for (let i = 0; i < mapCards.length; i++) {
                await MapData.deleteOne({_id: mapCards[i].mapData })
            }

            let deletedMapCards = await MapCard.deleteMany({_id:{$in:user.ownedMapCards}});
            await userInfoSchema.deleteOne({_id: user._id})

            return res.status(200).clearCookie("values").json({status: 'OK'});
        }
        catch(e){
            return res.status(400).json({status: "ERROR", error: true, message: e.toString()});
        }
    }
}

function makeKey() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 20; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

module.exports = userController;