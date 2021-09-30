const express = require('express')
const router = express.Router()
const mongoose=require('mongoose')
const User = mongoose.model('User')
const bcrypt = require('bcryptjs')
const Admin=mongoose.model('Admin')
require('dotenv').config()
const jwt=require("jsonwebtoken")
const JWT_SERECTKEY=process.env.JWT_SERECTKEY;

const middleware=(req,res,next)=>{
      //  console.log(req.headers)
        const {authorization} =req.headers
     //   console.log(authorization,"dfs")
        if(!authorization){
            return res.status(401).json({error:"you must be logged in"})
        }
        const token=authorization.replace("Bearer ","")
      //  console.log(token,"fadgfs")
        jwt.verify(token,JWT_SERECTKEY,(err,payload)=>{
            if(err)
            {
                return res.status(401).json({error:"you must be logged in"})
            }
         //   console.log(payload,token)
            const {_id}=payload
            User.findById(_id).then(userdata=>{
                req.user=userdata
                next()
            })  
        })
    }
const adminmiddleware=(req,res,next)=>{
//  console.log(req.headers)
    const {authorization} =req.headers
   console.log(authorization,"dfs")
    if(!authorization){
        return res.status(401).json({error:"yo must be logged in"})
    }
    const token=authorization.replace("Bearer ","")
//  console.log(token,"fadgfs")
    jwt.verify(token,JWT_SERECTKEY,(err,payload)=>{
        if(err){
            return res.status(401).json({error:"you must be logged in"})
        }
     //  console.log(payload,token)
        const {_id}=payload
        Admin.findById(_id).then(userdata=>{
            req.user=userdata
        //    console.log(userdata)
            next()
        })  
    })
}
router.post('/signup',(req,res)=>{
    const {name,email,password}=req.body
    if (!email  || !password ||!name){
        return res.status(422).json({error:"please enter all the fields"})
    }
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"user already exists"})
        }
        bcrypt.hash(password,13)
        .then(hashedpassword=>{
            const user = new User(  {
                email:email,
                password:hashedpassword,
                name
            })
            user.save()
            .then(()=>{
                //res.redirect('/signin')
                return res.json({message:"successfully Signup"})
            })
            .catch(error=>{
                    // console.log(error)
                    return res.json({error:error})
            })
        })  
    })
    .catch(error=>{
        console.log(error)
    })
})
router.post('/adminsignup',(req,res)=>{
    const {name,email,password}=req.body
    if (!email  || !password ||!name){
        return res.status(422).json({error:"please enter all the fields"})
    }
    Admin.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"user already exists"})
        }
        bcrypt.hash(password,13)
        .then(hashedpassword=>{
            const user = new Admin({
                email:email,
                password:hashedpassword,
                name
            })
            user.save()
            .then(()=>{
                return res.json({message:"successfully Signup"})
            })
            .catch(error=>{
                console.log(error)
            })
        })
        
    })
    .catch(error=>{
        console.log(error)
    })
})

router.get('/allusers',adminmiddleware,(req,res)=>{
    User.find()
   // console.log("entered..")
    .then(Users=>{
        res.json(Users)
    })
    .catch(err=>{
        res.json(err)
    })
})


router.get('/profile',middleware,(req,res)=>{
   // console.log(req.user)
   User.findOne({_id:req.user._id})
    .then(mypost=>{
        return res.json(mypost)
    })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/signin',(req,res,next)=>{
    const {email,password}=req.body
    if(!email || !password){
        return res.status(422).json({error:"please enter all the fields"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        console.log(savedUser)
        if(null){
            console.log(savedUser)
        }
        if(!savedUser){
            return res.status(422).json({error:"Invalid mail or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                const token=jwt.sign({_id:savedUser._id},JWT_SERECTKEY)
                console.log(token)
                const {_id,name,email}=savedUser
                res.json({token:token,user:{_id,name,email}})
            }
            else
            {
                next()
            }  
        })
        .catch(err=>{
            console.log(err)
        })
    })
},(req,res)=>{
    return res.status(422).json({error:"Invalid mail or password"})
})
router.post('/adminsignin',(req,res)=>{
    const {email,password}=req.body
    if(!email || !password){
        return res.status(422).json({error:"please enter all the fields"})
    }
    Admin.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({error:"Invalid mail or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                //res.send({message:"signin successful"})
                const token=jwt.sign({_id:savedUser._id},JWT_SERECTKEY)
                const {_id,email}=savedUser
                res.json({token:token,user:{_id,email}})
            }
            else{
                return res.status(422).json({error:"Invalid mail or password"})
            }  
        })
        .catch(err=>{
            console.log(err)
        })
    })
})
router.put('/updateuser/:userId',adminmiddleware,(req,res)=>{

    const id=req.params.userId;
    User.findByIdAndUpdate(id,req.body,{userFindAndModify:false})
    .then(user=>{
        if(!user){
        return res.status(422).json({message:"cannot update this user"})
        }
        else{
            res.send(user)
        }
    })
    .catch(err=>{
        console.log(err)
    })
})
router.delete('/deleteuser/:userId',adminmiddleware,(req,res)=>{
    User.findByIdAndDelete({_id:req.params.userId})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:err})
        }else{
            res.send({
                message:"user deleted successfully"
            })
        }
            
    })
    .catch(err=>{
        console.log(err)
    })
})
module.exports=router