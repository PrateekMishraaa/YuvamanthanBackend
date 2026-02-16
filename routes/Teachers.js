import express from "express";
import Teachers from "../models/Teacher.js";

const router = express.Router();

router.put("/teacher/:id", async (req, res) => {
  const id = req.params.id;          // ✅ correct extraction
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Teacher ID is required",
    });
  }

  try {
    let updatedTeacher;

    // First try updating by userId
    updatedTeacher = await Teachers.findOneAndUpdate(
      { userId: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // If not found by userId → try by Mongo _id
    if (!updatedTeacher) {
      updatedTeacher = await Teachers.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    // If still not found → create new teacher
    if (!updatedTeacher) {
      const newTeacher = new Teachers({
        userId: id,
        ...updateData,
      });

      updatedTeacher = await newTeacher.save();

      return res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        data: updatedTeacher,
      });
    }

    console.log("Teacher updated successfully:", updatedTeacher._id);

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });

  } catch (error) {
    console.error("Error updating teacher:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
