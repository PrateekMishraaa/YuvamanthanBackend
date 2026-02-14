import express from "express";
const router = express.Router();
import Institutions from "../models/InstituteRegister.js";

// Get institution by USER ID (not institution _id)
router.get('/institution/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    console.log("Searching for institution with userId:", userId);

    // Find institution by userId field (not _id)
    const institution = await Institutions.findOne({ userId: userId });
    
    console.log("Found institution:", institution);

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found for this user"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Institution data fetched successfully",
      data: institution
    });

  } catch (error) {
    console.error('Error fetching institution:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Update institution profile by USER ID
// Update institution profile - works with both userId and institution _id
// Update institution profile - works with both userId and institution _id
router.put('/institution-profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log("Updating institution with ID:", id);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required"
      });
    }

    let updatedInstitution;
    
    // First try to find by userId
    updatedInstitution = await Institutions.findOneAndUpdate(
      { userId: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    // If not found by userId, try by _id
    if (!updatedInstitution) {
      updatedInstitution = await Institutions.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }
    
    // If still not found, create new one
    if (!updatedInstitution) {
      // Check if this might be a userId for a new institution
      const newInstitution = new Institutions({
        userId: id,
        ...updateData
      });
      updatedInstitution = await newInstitution.save();
      
      return res.status(201).json({
        success: true,
        message: "Institution created successfully",
        data: updatedInstitution
      });
    }

    console.log("Institution updated successfully:", updatedInstitution._id);

    return res.status(200).json({
      success: true,
      message: "Institution profile updated successfully",
      data: updatedInstitution
    });

  } catch (error) {
    console.error('Error updating institution:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Create new institution with userId
router.post('/institution', async (req, res) => {
  try {
    const institutionData = req.body;
    
    // Check if institution already exists for this user
    if (institutionData.userId) {
      const existing = await Institutions.findOne({ userId: institutionData.userId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Institution already exists for this user"
        });
      }
    }
    
    const newInstitution = new Institutions(institutionData);
    const savedInstitution = await newInstitution.save();
    
    return res.status(201).json({
      success: true,
      message: "Institution created successfully",
      data: savedInstitution
    });

  } catch (error) {
    console.error('Error creating institution:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get institution by its own _id (if you still need this)
router.get('/institution-by-id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const institution = await Institutions.findById(id);
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: "Institution not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Institution data fetched successfully",
      data: institution
    });

  } catch (error) {
    console.error('Error fetching institution:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid institution ID format"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Rest of your routes (delete, get all, etc.)...
export default router;