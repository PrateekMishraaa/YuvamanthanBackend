import mongoose,{Schema} from "mongoose"

const TeacherRegistrationSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true,
        minlength:[10,"Phone number should be atleast in 10 digits"],
        maxlength:[10,"Phone number should not be more than 10 digits"]
    },
    dateofbirth:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true,
        enum:['male','female','other'],
        default:''
    },
    insituteWebsite:{
        type:String,
        required:true
    },
    socialMedia:{
        type:String,
        required:true,
        enum:['Facebook','Twitter','LinkedIn','Instagram','Youtube']
    },

},{
    timestamps:true
})
const Teachers = mongoose.model('Teachers',TeacherRegistrationSchema)
export default Teachers