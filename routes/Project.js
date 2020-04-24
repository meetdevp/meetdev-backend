const mongoose=require("mongoose");
const validator=require("mongoose-unique-validator");
const Schema=mongoose.Schema
const Student=require('./Student')


const Project=Schema({
    Title:{type:String, required:true},
    StudentId:{type:Schema.Types.ObjectId, ref:"Student",required:true},
    ProjectTechnologies:[],
    Discription:{type:String},
    Request:[],
    Collaborates:[],
    Status:[],
    Likes:{type:Number,default:0},
    WhoLiked:[],
    projectScreenShots:[]
}).plugin(validator);



module.exports = mongoose.model('Project',Project,'Projects');