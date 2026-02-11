import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    firstname:{
      type:String,
    },
    lastname:{
      type:String
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    mobile:{
      type:String,
      // required:true,
      minlength:[10,"Phone number should  be atleast in  10 digits"],
      maxlength:[10,"Phone number should not be more than 10 digits"]
    },
    password: {
      type: String,
      // required: true,
      minlength: [8, "Password should be at least 8 characters"],
      maxlength: [255, "Password should not be more than 255 characters"]
    },
    role:{
      type:String,
      enum:["teacher","student","institution"],
      required:true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return 
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
 
});

const Users = mongoose.model("Users", UserSchema);
export default Users;
