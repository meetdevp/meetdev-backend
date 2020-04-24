const mongoose=require('mongoose');
const validator=require('mongoose-unique-validator');
const Schema=mongoose.Schema;

const Student = Schema({
  Name : {type : String , require : true},
  Email : {type: String, required : true, unique:true,match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/},
  Password : {type: String, required : true},
  Phone : {type : Number ,default:null},
  Batch : {type : String,default:null},
  Department : {type : String,default:null},
  Year:{type:Number},
  Bio: {type : String,default:null},
  Projects : [],
  LikedProjects:[],
  Technologies :[],
  SendingRequest : [],
  IncomingRequest:[],
  ApprovedRequest : [],
  IsRegistered:{type:Boolean,default:false},
  profileImage:{type:String}
}).plugin(validator);



module.exports =  mongoose.model('Student',Student ,'Students');


