const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors=require('cors')
require('dotenv').config()
const PORT=process.env.PORT ||5500
// Connect to DB
const {mongoURI}=require('./keys');

const uri = process.env.mongoURI

mongoose.connect(uri, {
useNewUrlParser: true,
useUnifiedTopology: true,
});

const middleware=(req,res,next)=>{
    console.log("Middleware executed")
    next()
}
app.get('/',middleware,(req,res)=>{
    res.send('rajkumar')
})
mongoose.connection.on('connected',()=>{
    console.log("mongo yeah")
})

mongoose.connection.on('error',(err)=>{
    console.log("mongo error",err)
})

app.use(cors())
require('./models/user')
require('./models/admin')
app.use(express.json())
app.use(require('./routes/auth'))

app.listen(PORT,()=>{
    console.log("port working at", 5500)
});