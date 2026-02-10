import express from "express"
const router = express.Router()
import Users from "../models/User.js"
import Jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"


router.post('/register',async(req,res)=>{
    const {firstname,lastname,email,password,mobile} =req.body;
    if(!firstname || !lastname|| !mobile ||!email || !password){
        return res.status(400).json({message:"All fields are required"})
    }
    try{
        const isUserExist = await Users.findOne({email})
        if(isUserExist){
            return res.status(205).json({message:"User already exist with this email"})
        }
        const NewUser = await Users.create({
            email,
            password,
            firstname,
            lastname,
            mobile
        })
        console.log("user registered",NewUser)
        return res.status(200).json({message:"User created successfully",user:NewUser})
    }catch(error){
        console.log('error',error)
        return res.status(500).json({message:"Internal server error",error})
    }
});
router.post('/login',async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({message:"Invalid credentials"})
    }
    try{
        const isUser = await Users.findOne({email})
        if(!isUser){
            return res.status(404).json({message:"User not found"})
        }
        const isMatch = await bcrypt.compare(password,isUser.password)
        if(!isMatch){
            return res.status(403).json({message:"Incorrect password"})
        }
        const payload = {
            email:isUser.email,
            password:isUser.password,
            role:isUser.role,
            firstname:isUser.firstname,
            lastname:isUser.lastname,
            mobile:isUser.mobile,
        }
        const token = await Jwt.sign(payload,process.env.JWTSECRET,{expiresIn:'2d'})
        console.log("token",token,payload)
        return res.status(200).json({message:"User logged in successfully",token,payload})
    }catch(error){
        console.log("error",error)
        return res.status(500).json({message:"Internal server error",error})
    }
})

export default router;