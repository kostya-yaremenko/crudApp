/**
 * Created by kostya on 24.10.2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = new Schema({
    owner:String,
    img_name:String,
    img_path:String
});

module.exports = mongoose.model('image', ImageSchema);