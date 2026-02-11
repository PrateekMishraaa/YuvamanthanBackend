import express from "express"
const router = express.Router()
import Contacts from "../models/Contact.js"


router.post('/contact',async(req,res)=>{
    const {Fullname,Email,Subject,PhoneNumber,Message} = req.body;

    if(!Fullname || !Email || !Subject || !PhoneNumber || !Message){
        return res.status(400).json({message:"All fields are required"})
    }
    try{
        const isContact = await Contacts.findOne({Email})
        if(isContact){
            return res.status(300).json({message:"User already submitted query"})
        }
        const NewContact = await Contacts.create({
            Fullname,
            Email,
            Subject,PhoneNumber,Message
        })
        console.log('New Contact',NewContact)
        return res.status(200).json({message:"New Contact Registered Database",newcontact:NewContact})
    }catch(error){
        console.log('error',error)
        return res.status(500).json({message:"Internal server error",error})
    }
});
router.get('/all-contact',async(req,res)=>{
    try{
        const contactList = await Contacts.find()
        console.log("this is contact list",contactList)
        return res.status(200).json({message:"Contact data fetched from db",contactList})
    }catch(error){
        console.log("error",error)
        return res.status(500).json({message:"Internal server error",error})
    }
})

export default router