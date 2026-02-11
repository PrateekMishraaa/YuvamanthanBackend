import mongoose,{Schema} from "mongoose"

const ContactSchema = new Schema({
    Fullname:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        unique:true
    },
    Subject:{
        type:String
    },
    PhoneNumber:{
        type:String,
        required:true,
        minlength:[10,"Phone number should be at least in 10 digits"],
        maxlength:[10,"Phone number should not be more than 10 digits"]
    },
    Message:{
        type:String
    }
},{
    timestamps:true
})
const Contacts = mongoose.model('Contacts',ContactSchema)
export default Contacts