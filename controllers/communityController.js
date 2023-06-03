var mongoose = require('mongoose');
const User = require('../models/userInfoModel');
const MapCard = require('../models/mapCardModel')
const MapData = require('../models/mapDataModel')
const CommunityPreview = require('../models/communityPreviewModel')

class communityController {
    static async getCommunity(req, res) {
        try {
            let username = req.cookies.values.username;

            let currentUser = await User.findOne({username: username});
            let blockedUsers = currentUser.blockedUsers;
            let followedUsers = currentUser.usersFollowing;
            let comb = blockedUsers.concat(followedUsers);
            var mapCards = await MapCard.aggregate([{ $match: 
                { published: true, owner: { $nin: blockedUsers, $in: followedUsers } },
            }]);

            var mapCards2 = await MapCard.aggregate([ {
                $match: 
                    { published: true, owner: { $nin: comb } }
            }])

            return res.status(200).json({status: "OK", mapcards: [...mapCards, ...mapCards2]});
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async getCommunityGuest(req, res) {
        try {
            let mapCards = await MapCard.find({ published: true });

            return res.status(200).json({status: "OK", mapcards: mapCards});
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async getCommunityPreviewById(req, res) {
        try {
            var { id } = req.body;
            let username = req.cookies.values.username;

            var currentCommunityPreview = await CommunityPreview.findOne({ mapCard: new mongoose.Types.ObjectId(id) });
            var currentCommunityData = await MapData.findOne({ _id: currentCommunityPreview.mapData });
            var currentCommunityCard = await MapCard.findOne({ mapData: currentCommunityData._id });
            var currentOwner = await User.findOne({ _id: currentCommunityCard.owner });
            
            var currentUser = await User.findOne({ username: username});
            var like = false;
            var dislike = false;

            if (currentCommunityPreview.likes.includes(currentUser._id)){
                like = true;
            }

            if (currentCommunityPreview.dislikes.includes(currentUser._id)) {
                dislike = true;
            }

            var currentUser = await User.findOne({ username: username});
            let userToFollow = currentCommunityCard.owner;
            let isFollowing = false;
            currentUser.usersFollowing.forEach(id => {
                if (id.toString() === userToFollow.toString()) {
                    isFollowing = true;
                }
            });

            let userToBlock = currentCommunityCard.owner;
            let isBlocked = false;
            currentUser.blockedUsers.forEach(id => {
                if (id.toString() === userToFollow.toString()) {
                    isBlocked = true;
                }
            });

            // console.log("current preview", currentCommunityPreview._id.toString());
            return res.status(200).json({
                status: "OK", 
                title: currentCommunityPreview.title,
                id: currentCommunityPreview._id.toString(),
                ownerName: currentOwner.username,
                follow: isFollowing ? "Followed" : "Follow",
                block: isBlocked ? "Blocked" : "Block",
                type: currentCommunityData.type, 
                feature: JSON.stringify(currentCommunityData.feature), 
                graphicalData: JSON.stringify(currentCommunityData.graphicalData),
                comments: currentCommunityPreview.comments, 
                like: like,
                likeAmount: currentCommunityPreview.likes.length,
                dislike: dislike,
                dislikeAmount: currentCommunityPreview.dislikes.length,
                reports: currentCommunityPreview.reports
            });
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async forkCommunityMap(req, res) {
        try {
            var { id, newName } = req.body;
            let username = req.cookies.values.username;

            var currentCommunityPreview = await CommunityPreview.findOne({ _id: new mongoose.Types.ObjectId(id) });
            var currentCommunityData = await MapData.findOne({ _id: new mongoose.Types.ObjectId(currentCommunityPreview.mapData) });
            var currentMapCard = await MapCard.findOne({ mapData: new mongoose.Types.ObjectId(currentCommunityData._id) });
            
            let mapCardObjId = new mongoose.Types.ObjectId();
            let mapDataObjId = new mongoose.Types.ObjectId();

            let mapDataObj = currentCommunityData.toObject();
            delete mapDataObj._id;
            mapDataObj._id = mapDataObjId
            var mapDataClone = new MapData(mapDataObj);
            await mapDataClone.save();

            let mapCardObj = currentMapCard.toObject();
            delete mapCardObj._id;
            mapCardObj._id = mapCardObjId;
            mapCardObj.title = newName;
            mapCardObj.mapData = mapDataObjId;
            mapCardObj.published = false;
            var mapCardClone = new MapCard(mapCardObj);
            await mapCardClone.save();

            var user = await User.findOneAndUpdate({ username: username }, { $push: { ownedMapCards: mapCardObjId } });
            await user.save();

            return res.status(200).json({status: 'OK'});
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async reportCommunityMap(req, res) {
        try {
            var { id, reportMessage } = req.body;

            var currentCommunityPreview = await CommunityPreview.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $push: { reports: reportMessage } });
            await currentCommunityPreview.save();

            return res.status(200).json({status: 'OK'});
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async likeCommunityMap(req, res) {
        try {
            var { id } = req.body;
            let username = req.cookies.values.username;

            var currentOwner = await User.findOne({ username: username });
            var availableCommunityPreview = await CommunityPreview.find({likes: {$in: [currentOwner._id]}}); 
            var currentCommunityPreview = await CommunityPreview.findOne({ _id: new mongoose.Types.ObjectId(id) });
            let arr =  currentCommunityPreview.likes;
            let found = false;
            for(let i = 0;i<arr.length;i++){
                if(arr[i]===currentOwner._id.toString()){
                    found = true;
                }
            }
            if (found==true) { // already liked, so unlike it
                var communityPreview = await CommunityPreview.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $pull: { likes: currentOwner._id.toString() } }, {new: true});
                await communityPreview.save();
                return res.status(200).json({status: 'UNLIKED', likeLength: communityPreview.likes.length, dislikeLength:  communityPreview.dislikes.length });
            } else { // didn't like it yet
                var currentDislikes = await CommunityPreview.find({dislikes: {$in: [currentOwner._id]}});
                if (currentDislikes) { // check if already dislike, if you are, then remove dislike
                    var dislikePreview = await CommunityPreview.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $pull: { dislikes: currentOwner._id.toString() } }, {new: true});
                    await dislikePreview.save();
                    // console.log("currentDislikes when liking", dislikePreview);
                }
                // like 
                var communityPreview = await CommunityPreview.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $push: { likes: currentOwner._id.toString() } }, {new: true});
                await communityPreview.save();
                return res.status(200).json({status: 'LIKED', likeLength: communityPreview.likes.length, dislikeLength:  communityPreview.dislikes.length });
            }
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async dislikeCommunityMap(req, res) {
        try {
            var { id } = req.body;
            let username = req.cookies.values.username;
            
            var currentOwner = await User.findOne({ username: username });
            console.log(id)
            
            var availableCommunityPreview = await CommunityPreview.find({dislikes: {$in: [currentOwner._id]}}); 
            var currentCommunityPreview = await CommunityPreview.findOne({ _id: new mongoose.Types.ObjectId(id) });
            console.log(currentCommunityPreview.dislikes)
            let arr =  currentCommunityPreview.dislikes;
            
            let found = false;
            console.log(currentOwner._id.toString())
            for(let i = 0;i<arr.length;i++){
                console.log(arr[i])
                if(arr[i]===currentOwner._id.toString()){
                    found = true;
                }
            }
            console.log(found)
            if (found ==true) {
                var currentCommunityPreview = await CommunityPreview.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $pull: { dislikes: currentOwner._id.toString() } }, {new: true});
                await currentCommunityPreview.save();
                return res.status(200).json({status: 'UNDISLIKED', likeLength: currentCommunityPreview.likes.length, dislikeLength:  currentCommunityPreview.dislikes.length, availableCommunityPreview: availableCommunityPreview});
            } else {
                var currentLikes = await CommunityPreview.find({likes: {$in: [currentOwner._id]}});
                if (currentLikes) {
                    var likePreview = await CommunityPreview.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $pull: { likes: currentOwner._id.toString() } }, {new: true});
                    await likePreview.save();
                }
                var currentCommunityPreview = await CommunityPreview.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $push: { dislikes: currentOwner._id.toString() } }, {new: true});
                await currentCommunityPreview.save();
                return res.status(200).json({status: 'DISLIKED', likeLength: currentCommunityPreview.likes.length, dislikeLength:  currentCommunityPreview.dislikes.length});
            }
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async followCommunityMap(req, res) {
        try {
            var { id } = req.body;
            let username = req.cookies.values.username;
            var currentCommunityPreview = await CommunityPreview.findOne({ _id: new mongoose.Types.ObjectId(id) });
            var currentCommunityCard = await MapCard.findOne({ _id: new mongoose.Types.ObjectId(currentCommunityPreview.mapCard) });

            var currentUser = await User.findOne({ username: username});
            let userToFollow = currentCommunityCard.owner;
            let isFollowing = false;
            currentUser.usersFollowing.forEach(id => {
                if (id.toString() === userToFollow.toString()) {
                    isFollowing = true;
                }
            });
            if (isFollowing === false) {
                var currentUser = await User.findOneAndUpdate({ username: username}, { $push: { usersFollowing: currentCommunityCard.owner } });
                await currentUser.save();
                return res.status(200).json({status: 'Followed', follow: true});
            } else {
                var currentUser = await User.findOneAndUpdate({ username: username}, { $pull: { usersFollowing: currentCommunityCard.owner } });
                await currentUser.save();
                return res.status(200).json({status: 'Follow', follow: false});
            }
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async blockCommunityMap(req, res) {
        try {
            var { id } = req.body;
            let username = req.cookies.values.username;

            var currentCommunityPreview = await CommunityPreview.findOne({ _id: new mongoose.Types.ObjectId(id) });
            var currentCommunityCard = await MapCard.findOne({ _id: new mongoose.Types.ObjectId(currentCommunityPreview.mapCard) });

            var currentUser = await User.findOne({ username: username});
            let userToBlock = currentCommunityCard.owner;
            let isBlocked = false;
            currentUser.blockedUsers.forEach(id => {
                if (id.toString() === userToBlock.toString()) {
                    isBlocked = true;
                }
            });
            if (isBlocked === false) {
                var currentUser = await User.findOneAndUpdate({ username: username}, { $push: { blockedUsers: currentCommunityCard.owner } });
                await currentUser.save();
                return res.status(200).json({status: 'Blocked'});
            } else {
                var currentUser = await User.findOneAndUpdate({ username: username}, { $pull: { blockedUsers: currentCommunityCard.owner } });
                await currentUser.save();
                return res.status(200).json({status: 'Block'});
            }
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async addComment(req, res) {
        try {
            var { id, comment } = req.body;
            let username = req.cookies.values.username;

            var currentCommunityPreview = await CommunityPreview.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { $push: { comments: { comment: comment, username: username } }});
            currentCommunityPreview.save();

            return res.status(200).json({status: 'OK',
            username:username
            });
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async searchMap(req, res) {
        try {
            var { searchName } = req.body;
            let username = req.cookies.values.username;

            var user = await User.findOne({username: username});
            let blockedUsers = user.blockedUsers;
            var communityPreview = {};
            if (user) {
                communityPreview = await MapCard.aggregate([
                    { $match: 
                        { 
                            published: true, 
                            owner: {$nin: blockedUsers}, 
                            $or: [{title: { $regex: '.*' + searchName + '.*', $options: 'i'}}, {classification: searchName}]
                        }
                    }
                ]);
            }
            
            return res.status(200).json({status: 'OK', mapcards: communityPreview});
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }

    static async sortMap(req, res) {
        try {
            var { type } = req.body;
            
            let username = req.cookies.values.username;

            var user = await User.findOne({username: username});
            let blockedUsers = user.blockedUsers;
            var communityPreview = {};
            if (user) {
                communityPreview =  type === "name" ?  
                await MapCard.aggregate([{ $match: { published: true, owner: {$nin: blockedUsers} }}]).collation({'locale':'en'}).sort({title: 1}) :
                await MapCard.aggregate([{ $match: { published: true, owner: {$nin: blockedUsers} }}]).collation({'locale':'en'}).sort({updatedAt: 1})
            }
            
            return res.status(200).json({status: 'OK', mapcards: communityPreview});
        }
        catch(e){
            console.log(e.toString())
            return res.status(400).json({error: true, message: e.toString() });
        }
    }
};

module.exports = communityController;