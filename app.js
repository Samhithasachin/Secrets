//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
mongoose.set('strictQuery',false);

main().catch(err=>console.log(err));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser:true});
    console.log("Successfully connected")
}

const userSchema = new mongoose.Schema ({
    email : String,
    password : String
});


userSchema.plugin(encrypt, {secret:process.env.SECRET,encryptedFields:['password']});

const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));

app.get("/",function(req,res){
    res.render("home");
})

app.get("/login",function(req,res){
    res.render("login");
})

app.get("/register",function(req,res){
    res.render("register");
})

app.post("/register", function(req,res){
    const newUser = new User({
        email : req.body.username,
        password : req.body.password
    });
    newUser.save()
    .then(function(ans){
        console.log("user added to database");
        res.render("secrets");
    })
    .catch(function(err){
        console.log(err);
    })
});

app.post("/login", function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username})
    .then(function(foundUser){
        if(foundUser){
            if(foundUser.password === password){
                res.render("secrets");
            }
            else{
                console.log("Password is wrong");
            }
        }
        else{
            console.log("email not registered");
        }
    })
    .catch(function(err){
        console.log(err);
    });



});



app.listen(3000, function(){
    console.log("Server has started port 3000.");
});