const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
/*
    This is where we specify the format of the data we're going to put into
    the database.
*/
const communityPreviewSchema = new Schema(
    { 
        title: { type: String, required: true },
        mapData: { type: ObjectId, required: true },
        mapCard: { type: ObjectId, required: true },
        comments: { type: [
            {
                comment: {type: String},
                username: {type: String}
            }
        ], required: true },
        likes:{ type: [String], required: true },
        dislikes:{ type: [String], required: true },
        reports:{ type: [String], required: true }
    },
    { timestamps: true },
)

module.exports = mongoose.model('CommunityPreview', communityPreviewSchema)
