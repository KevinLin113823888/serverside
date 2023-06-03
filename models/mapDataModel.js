const mongoose = require('mongoose')
var GeoJSON = require('mongoose-geojson-schema');
const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed;
const ObjectId = Schema.Types.ObjectId
/*
    This is where we specify the format of the data we're going to put into
    the database.
*/
const mapDataSchema = new Schema(
    {
        type: { type: String, required: true },
        feature: { type: [Schema.Types.Feature], required: true},
        // mapProperties: { type: Object, required: false },
        graphicalData:{type:{
            backgroundColor: String,
            textBoxList: {type:[{
                overlayText: String,
                coords: {type: {
                    lat: { type: Number },
                    lng: { type: Number }
                }}
            }]},
            legend: {type:[{
                color: String,
                legendText: String
            }]}
        }, required: false }
    },
    { timestamps: true },
)

module.exports = mongoose.model('MapData', mapDataSchema)
