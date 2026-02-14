import mongoose, { Schema } from "mongoose";

const InstituteRegisterSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, // Fixed: removed () from ObjectId
    ref: "Users",
    // required: true
  },
  instituteDetails: [
    {
      typeOfInstitute: {
        type: String,
        // required: true,
      },
      typeOfUniversity: {
        type: String,
        // required: true,
      },
      educationMedium: {
        type: String,
        // required: true,
      },
    },
  ],
  aboutInstitution: [
    {
      instituteName: {
        type: String,
        // required: true,
      },
      aboutInstitute: {
        type: String,
        // required: true,
      },
    },
  ],
  instituteAddress: [
    {
      country: {
        type: String,
        // required: true,
      },
      state: {
        type: String,
        // required: true,
      },
      district: {
        type: String,
        // required: true,
      },
      streetAddress: {
        type: String,
        // required: true,
      },
      city: {
        type: String,
        // required: true,
      },
      pincode: {
        type: String,
        // required: true,
      },
    },
  ],
  appearance: [ // Fixed typo: appreance -> appearance
    {
      instituteLogo: {
        type: String,
        // required: true,
      },
      instituteWebsite: {
        type: String,
        // required: true,
      },
    },
  ],
  socialLinks: [
    {
      faceBook: {
        type: String,
        // required: true,
      },
      twitter: {
        type: String,
        // required: true,
      },
      linkedIn: {
        type: String,
        // required: true,
      },
      instagram: {
        type: String,
        // required: true,
      },
      youtube: {
        type: String,
        // required: true,
      },
    },
  ],
  InstitutePersonalInfo: [
    {
      Firstname: {
        type: String,
        // required: true,
      },
      lastName: {
        type: String,
      },
      Phone: {
        type: String,
        // required: true,
        minlength: [10, "Phone number should be atleast in 10 digits"],
        maxlength: [10, "Phone number should not be more than 10 digits"],
      },
      AssociatedWithInstitute: {
        type: String,
      },
    },
  ],
  instituteDocuments: [
    {
      ProofOfIdentity: {
        type: String,
        // required: true,
      },
      ProofOfAddress: {
        type: String,
        // required: true,
      },
    },
  ],
  MailingAddress: [
    {
      Country: {
        type: String,
        // required: true,
      },
      State: {
        type: String,
        // required: true,
      },
      District: {
        type: String,
        // required: true,
      },
      StreetAddress: {
        type: String,
        // required: true,
      },
      City: {
        type: String,
        // required: true,
      },
      Pincode: {
        type: String,
        // required: true,
        maxlength: [6, "Pincode should not be more than in 6 digits"],
      },
    },
  ],
  StudentTeacherWithoutVerification: {
    type: Boolean,
    default: false,
  },
  AccountManagerDetails: [{
    Fullname: {
      type: String,
      // required: true
    },
    Designation: {
      type: String,
      // required: true
    },
    Email: {
      type: String,
      // required: true
    },
    Phone: {
      type: String,
      // required: true,
      // minlength: [10, "Phone number should be at least in 10 digits"],
      // maxlength: [10, "Phone number should not be more than 10 digits"]
    },
    ManagerType: { // Fixed typo: ManagerTpe -> ManagerType
      type: String,
      enum: ["Admin", "Moderator", "Manager"],
      default: "Moderator"
    },
  }]
}, {
  timestamps: true
});

const Institutions = mongoose.model('Institutes', InstituteRegisterSchema);
export default Institutions;