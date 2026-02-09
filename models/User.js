import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password should be at least 8 characters"],
      maxlength: [255, "Password should not be more than 255 characters"]
    },
    role:{
      type:String,
      enum:["admin","user"],
      default:"user"
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
