const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors=require('cors')
require('dotenv').config()
const PORT=process.env.PORT ||5500
// Connect to DB

const uri = process.env.mongoURI

mongoose.connect(uri, {
useNewUrlParser: true,
useUnifiedTopology: true,
});

app.use(cors())
require('./models/user')
require('./models/admin')
app.use(express.json())
app.use(require('./routes/auth'))

app.listen(PORT,()=>{
    console.log("port working at", 5500)
});