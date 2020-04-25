const express = require('express');
const router=express.Router();
const bcrypt=require('bcrypt');
const multer=require('multer')

const test=require('./test')


const storage1=multer.diskStorage({
  destination:function(req ,file,cb){
    cb(null,"./ProfileImage")
  },
  filename: function(req,file,cb){
    cb(null, file.originalname)
  }
});

const fileFilter1 = function(req,file,cb){
  if(file.mimetype ==='image/jpeg'||file.mimetype==='image/png'){
  cb(null,true)}
  else{
  cb(new Error('Not a image'),false)}
}

const upload=multer({storage:storage1,fileFilter:fileFilter1,limits:{fileSize:1024*1024*5}})


const storage2=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,'./ProjectScreenShots')
  },
  filename: function(req,file,cb){
    cb(null,file.originalname)
  }
})

const upload2=multer({storage:storage2,fileFilter:fileFilter1,limits:{fileSize:1024*1024*5}})


const Project=require('./Project');
const Student = require('./Student');

router.post('/sign-up',(req,res)=> {
  console.log(req.body);
  Student.find({Email:req.body.Email})
  .then(student=>{
    if(student.length>0)
    {
      res.json(
        {
          msg:"Email Already Exist"
        }
      )
    }else{
  bcrypt.hash(req.body.Password,10,(err,hash)=>{
    if(err){
      return res.json({
        msg:'SignUp Failed',
        error:err
      })
    }else{
    const item = {
    Name  : req.body.Name,
    Email : req.body.Email,
    Password : hash
    }
    const data = new Student(item);
    data.save()
      .then(result => {
        res.json({
          msg: "Sign Up Successfully",
          Student : result
        })
      })
      .catch(err =>{
        res.json({
          msg: "Sign Up Failed",
          error:err
         })
       })
      }
    })}
  })
})

router.post('/log-in',(req,res)=>{
  Student.find({Email:req.body.Email})
  .then(Student=>{
    const ans=Student
    if(Student.length<=0){
       return res.json({
        msg:"Email Do not exist"
      })
    }
    
    bcrypt.compare(req.body.Password,Student[0].Password)
    .then(result=>{
        if(result){
         return res.json(
            {
              msg:"Login Successfully",
              Student:ans
            }
          )
        } else{
        return res.json(
          {
            msg:"Incorrect Password"
          }
        )}
    
    })
    .catch(err=>{
      return res.json(
        {
          msg:"Log in Failed1",
        })
      })    
  })
  .catch(err=>{
    return res.json(
      {
        msg:"Log in Failed",
      })
    })
})

router.patch('/insert-details',upload.single('profileImage'),(req,res)=>{
  console.log(req.file)
  Student.findByIdAndUpdate({_id:req.body.Id},{
    Department:req.body.Department,
    Batch:req.body.Batch,
    Phone:req.body.Phone,
    Bio:req.body.Bio,
    $addToSet:{
      'Technologies': req.body.Technologies
     },
     IsRegistered:true,
     profileImage:req.file.path
  })
    .then(result=>{
    return res.json(
      {
        msg:"detailes added successfully",
        Student:result
      }
    )
    })
  .catch(err=>
    {
      res.json(
        {
          msg:"details addition failed",
          error:err
        })
     })
})

router.delete('/delete-students',(req,res)=>{
  Student.deleteMany({_id:{$in:req.body.Id}})
  .then(result=>{
  return  res.json(
      {
        msg:"deleted Successfully",
        student:result
      }
    )
  })
  .catch(err=>{
    res.json({
      msg:'deletion failed',
      error:err
    })
  })
})
 

router.delete('/delete-projects',(req,res)=>{
  Project.deleteMany({_id:{$in:req.body.Id}})
  .then(result=>{
    res.json({  
      msg:"deleted successfully",
      Projects:result
    })
  })
  .catch(err=>{
    res.json({
      msg:'Deletion Failed',
      error:err
    })
  })
})
router.get('/get-projects',(req,res)=>{
  Project.find()
  .then(doc=>{
    res.json(
      {
        result:doc
      }
    )
  })
  .catch(err=>{
      res.json(
        {
          msg:"Something Wrong",
          error:err
        }
      )
    })
})

router.post('/get-project-byStudentId',(req,res,next)=>{

  console.log(req.body)
  Project.find({  StudentId : {$in: req.body.StudentId }})
  //console.log(req.body.studentid)
  .then(doc=>{
    res.json(
      {
        result:doc
      }
    )
  })
  .catch(
    err=>{
      res.json(
        {
          msg:"Something Wrong",
          error:err
        }
      )
    })
})

router.get('/get-students',(req,res,next)=>{
  Student.find()
  .then(doc=>{
    res.json(
      {
        result:doc
      }
    )
  })
  .catch(
    err=>{
      res.json(
        {
          msg:"SOmething Wrong",
          error:err
        }
      )
    })
})

router.post('/get-student-byId',(req,res)=>{
  Student.findById({_id:req.body.StudentId})
  .then(result=>{
    return res.json({
      Student:result
    })
  })
  .catch(err=>{
    return res.json({
      msg:"Failed Getting Student",
      error:err
    })
  })
})

router.post('/add-project',(req,res)=>{
  Student.findById({_id:req.body.StudentId})
  .then(result=>{
    console.log(result)
      const item = {
        Title:req.body.Title,
        StudentId: req.body.StudentId,
        Discription:req.body.Discription
      }
        const data=new Project(item);
        data.save()
          .then(result => {
           return Project.findByIdAndUpdate({_id:result._id},{
              $push:{
                ProjectTechnologies:{$each:req.body.ProjectTechnologies}
              },
              $addToSet:{
                Status:{
                  startDate:req.body.startDate,
                  endDate:req.body.endDate
                }
              }
            })
            .then(result=>{
              return Student.findByIdAndUpdate({_id:result.StudentId},{
                $addToSet:({
                  Projects: result._id
                })
              })
              .then(result=>{
                res.json({
                  msg:'Project Added Successfully',
                  Student:result
                })
              })
            })
          })
        .catch(err=>{
          res.json({
            msg:"Project Added failed",
              error:err
            })
          })
        })
      .catch(err=>{
         res.json(
          {
            msg:"Student Doesn't Exist"
            
          }
        )
        })
  })

  router.patch('/upload-screenshots',upload2.array('projectScreenShots'),(req,res,next)=>{
    console.log(req.files)
    const paths=[]
    for(const x of req.files){
        paths.push(x.path)
    }
    console.log(paths)
    Project.findByIdAndUpdate({_id:req.body.projectId},{
      $push:{
        projectScreenShots:{$each:paths}
      }
    })
    .then(result=>{
      res.status(200).json({
        msg:"Successfully Uploaded",
        request:{
          type:"GET",
          url:"https://minor-backend.herokuapp.com/get-projects"
        }
      })
    })
    .catch(err=>{
      res.status(400).json({
        msg:"Uploading Failed",
        error:err
      })
    })

  })

router.delete('/delete-project',(req,res)=>{
  Project.findByIdAndDelete({_id:req.body.projectId})
  .then(result=>{
    return Student.findByIdAndUpdate({_id:result.StudentId},{
      $pull:{
        Projects:req.body.projectId
      }
    })
    return Student.findByIdAndUpdate({_id})
  })
})

router.patch('/send-request',(req,res)=>{
  return Project.findByIdAndUpdate({_id:req.body.ProjectId},{
    $addToSet:
      {
        Request:req.body.SenderId
       
      }
  })
  .then(result=>{
   return Student.findByIdAndUpdate({_id:result.StudentId},{
      $addToSet:{
        IncomingRequest:
          {ProjectId:req.body.ProjectId,
          SenderId:req.body.SenderId,
        }
      }
    })
  })
  .then(result=>{
    return Student.findByIdAndUpdate({_id:req.body.SenderId},{
      $addToSet:{
        SendingRequest:req.body.ProjectId
    }
    })
  }
  )
  .then(result =>{
    res.json({
      msg:"Request Sent Successfully",
      Student:result
    })
  })
  .then(err=>{
    res.jsom({
      msg:"Request Failed",
      error:err
    })
  })
})

router.patch('/accept-request',(req,res)=>{
  Student.find({IncomingRequest:{$elemMatch:{SenderId:req.body.SenderId,ProjectId:req.body.ProjectId}}})
  .then(result=>{
    //console.log(result[0]._id)
       return Student.findByIdAndUpdate({_id:result[0]._id},{
      $pull:{
        IncomingRequest:{SenderId:req.body.SenderId,ProjectId:req.body.ProjectId}
      }
    })
    .then(result=>{
      return Student.findByIdAndUpdate({_id:req.body.SenderId},{
       $pull:{
         SendingRequest:req.body.ProjectId
       },
       $addToSet:{
        ApprovedRequest:req.body.ProjectId
       }
     })
    })
    .then(result=>{
      return Project.findByIdAndUpdate({_id:req.body.ProjectId},{
       $pull:{
         Request:req.body.SenderId
       }
       ,
       $addToSet:{
         Collaborates:req.body.SenderId
       }
     })
    })
     .then(result=>{
      return res.json({
         msg:"Successfully Accepted",
         Student:result

       })
     })
     .catch(err=>{
      return res.json({
         msg:"Failed Accepting Request",
         error:err
       })
     })
    })
  .catch(err=>{
   return res.json({
      msg:"Invalid Request",
      error:err
    })
  })
})

router.patch('/reject-request',(req,res)=>{
  Student.find({IncomingRequest:{$elemMatch:{SenderId:req.body.SenderId,ProjectId:req.body.ProjectId}}})
  .then(result=>{
    //console.log(result[0]._id)
       return Student.findByIdAndUpdate({_id:result[0]._id},{
      $pull:{
        IncomingRequest:{SenderId:req.body.SenderId,ProjectId:req.body.ProjectId}
      }
    })
    .then(result=>{
      return Student.findByIdAndUpdate({_id:req.body.SenderId},{
       $pull:{
         SendingRequest:req.body.ProjectId
       }
     })
    })
    .then(result=>{
      return Project.findByIdAndUpdate({_id:req.body.ProjectId},{
       $pull:{
         Request:req.body.SenderId
       }
     })
    })
     .then(result=>{
      return res.json({
         msg:"Successfully Rejected",
         Student:result

       })
     })
     .catch(err=>{
      return res.json({
         msg:"Failed Accepting Request",
         error:err
       })
     })
    })
  .catch(err=>{
   return res.json({
      msg:"Invalid Request",
      
    })
  })
})

router.patch('/cancle-request',(req,res)=>{
  Student.find({SendingRequest:req.body.ProjectId}) 
  .then(result=>{
    console.log(result)
    return Student.findByIdAndUpdate({_id:req.body.SenderId},{
      $pull:{
        SendingRequest:req.body.ProjectId
      }
    })
    .then(result=>{
     
      return Project.findByIdAndUpdate({_id:req.body.ProjectId},{
        $pull:{
          Request:req.body.SenderId
        }
      })
      .then(result=>{
        return Student.findByIdAndUpdate({_id:result.StudentId},{
          $pull:{
            IncomingRequest:{SenderId:req.body.SenderId,ProjectId:req.body.ProjectId}
          }
        })
      })
    })
    .then(result=>{
      return res.json({
        msg:"SUccessfully Canceled"
      })
    })
    .catch(err=>{
      res.json({
        msg:"Failed Cancel Request",
        error:err
      })
    })
  })
  .catch(err=>{
    return res.json({
      msg:"Invalid Request",
    })
  })

})

router.patch('/like-project',(req,res)=>{
  Project.findByIdAndUpdate({_id:req.body.ProjectId},{
    $addToSet:{
      WhoLiked:req.body.StudentId,
    
    },
    $inc:{
      Likes:1
    }
  })
    .then(result=>{
     return Student.findByIdAndUpdate({_id:req.body.StudentId},{
       $addToSet:{
         LikedProjects:result._id
       }
     })
      .then(result=>{
        return res.json({
          msg:"Successfully Liked",
          Student:result
        })
      })
      .catch(err=>{
      return res.json({
          msg:"Failed Like the Project",
          error:err
        })
      })
  })
  .catch(err=>{
   return res.json({
      msg:"Failed Like the Project",
      error:err
    })
  })
})

router.patch('/unlike-project',(req,res)=>{
  Project.findByIdAndUpdate({_id:req.body.ProjectId},{
    $pull:{
      WhoLiked:req.body.StudentId
    },
    $inc:{
      Likes:-1
    }
  })
    .then(result=>{
     return Student.findByIdAndUpdate({_id:req.body.StudentId},{
       $pull:{
         LikedProjects:result._id
       }
     })
      .then(result=>{
        return res.json({
          msg:"Successfully UnLiked",
          Student:result
        })
      })
      .catch(err=>{
      return res.json({
          msg:"Failed Like the Project",
          error:err
        })
      })
  })
  .catch(err=>{
   return res.json({
      msg:"Failed unLike the Project",
      error:err
    })
  })
})

router.delete('/delete-student/:studentId',async(req,res)=>{
  const id=req.params.studentId
  Student.findById({_id:id})
  .then(result=>{
    if(result){
   // console.log(result)
    deletedProjects(result.Projects)
      return res.status(200).json({
        msg:"Successfully Deleted"
         })
  }
  else{
    return res.status(404).json({
      msg:"Student Not Found",
      url:"https://minor-backend.herokuapp.com/get-students"
    })
  }
  })
  .catch(err=>{
    res.status(400).json({
      msg:"error",
      error:err
    })
  })
})
module.exports = router;



// function serchProject(x){
//   return new Promise(async(resolve)=>{
//     const result = await Project.findById({_id:x})
//     return resolve(result)
//   })
// }

// async function deletedProjects(projects){
//   for(const x of projects){
//     console.log('--projectid--'+x)
//     const result=await serchProject(x);
//     console.log('---wholiked--',result.WhoLiked)
//    //await fetchStudent(result.WhoLiked,result._id,1)
//     await fetchStudent(result.Request,result._id,2)
//   }
//   //  Project.deleteMany({_id:{$in:projects}})
//   //  .exec()
//   //  .then(result=>{
//   //    console.log(result)
//   //  })
// }
  

// async function fetchStudent(student,pi,a){
//  return new Promise(async(resolve)=>{
//   for(const x of student){
//     console.log('---stid----',x,a)
//     const result=await popId(x,pi,a)
//    // console.log('---liked-----',result.LikedProjects)
//   }
//   return resolve()
// })
// }

// function popId(x,pi,a){

//   return new Promise(async(resolve)=>{

//   const result=await Student.findByIdAndUpdate({_id:x}
//     ,{
//     $pull:{
//       SendingRequest:pi
//     }  
//   })
//   .exec()
//   return resolve()
// })
// }


//  function resolveAfter2Seconds(id) {
//   return new Promise(async(resolve) => {
//     const result = await Project.findById({_id:id})
//      return resolve(result);
//   });
// }

// async function deletedProjects(project){
// for (const x of project){ 
//   const result = await resolveAfter2Seconds(x);
//   console.log('#############x'+x)
//   fetchStudent(result.WhoLiked,x);
//   // console.log(result);
// }
//  Project.deleteMany({_id:{$in:project}})
//  .then(result=>{
//    console.log(result,'#deleted project############################');
//  })
// }

// function fetchStudent(students,pi){
//   students.forEach(async(e)=> {
//     const result = await popStudent(e,pi);
//     console.log('++++e++++',e);
//     console.log('---------------------',result)
//     })
//     }
// function popStudent(id,pi){
  
//   return new Promise(async(resolve) => {
//     const result = await Student.findByIdAndUpdate({_id:id},{
//       $pull:{
//         LikedProjects:pi
//       }
//     })
//     console.log('%%%%%%%%%%%',pi,result)
//     console.log(resolve(result))
//     return resolve(result);
//   })
// }

