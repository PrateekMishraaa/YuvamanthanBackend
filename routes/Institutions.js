import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import Institutions from '../models/InstituteRegister.js'; // Adjust path as needed

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        
        // Categorize files based on fieldname
        if (file.fieldname === 'instituteLogo') {
            uploadPath += 'logos/';
        } else if (file.fieldname === 'ProofOfIdentity' || file.fieldname === 'ProofOfAddress') {
            uploadPath += 'documents/';
        }
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif) and documents (pdf, doc, docx) are allowed'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

// Helper function to delete old files
const deleteOldFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Helper function to parse form data with nested arrays/objects
const parseFormData = (body) => {
    const result = {};
    
    Object.keys(body).forEach(key => {
        // Split the key by brackets: appearance[0][instituteWebsite]
        const matches = key.match(/^([^\[\]]+)(?:\[(\d+)\])?(?:\[([^\[\]]+)\])?$/);
        
        if (matches) {
            const [, mainField, index, subField] = matches;
            
            if (index !== undefined && subField !== undefined) {
                // Handle nested array fields: appearance[0][instituteWebsite]
                if (!result[mainField]) {
                    result[mainField] = [];
                }
                if (!result[mainField][index]) {
                    result[mainField][index] = {};
                }
                result[mainField][index][subField] = body[key];
            } else if (index !== undefined) {
                // Handle simple array fields: socialLinks[0]
                if (!result[mainField]) {
                    result[mainField] = [];
                }
                result[mainField][index] = body[key];
            } else {
                // Handle top-level fields
                result[mainField] = body[key];
            }
        } else {
            // Handle simple fields
            result[key] = body[key];
        }
    });
    
    return result;
};

// Main PUT route with file upload
router.put('/institution-profile/:id', 
    upload.fields([
        { name: 'instituteLogo', maxCount: 1 },
        { name: 'ProofOfIdentity', maxCount: 1 },
        { name: 'ProofOfAddress', maxCount: 1 }
    ]),
    handleMulterError,
    async (req, res) => {
        try {
            const { id } = req.params;
            
            console.log("Updating institution with ID:", id);
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "ID is required"
                });
            }

            // Parse form data (handles nested arrays/objects)
            let updateData = parseFormData(req.body);
            
            console.log("Parsed update data:", JSON.stringify(updateData, null, 2));

            // Get existing institution to delete old files
            let existingInstitution = await Institutions.findOne({ userId: id }) || 
                                    await Institutions.findById(id);

            // Handle file uploads
            if (req.files) {
                // Process instituteLogo
                if (req.files['instituteLogo']) {
                    const logoFile = req.files['instituteLogo'][0];
                    
                    // Ensure appearance array exists
                    if (!updateData.appearance) {
                        updateData.appearance = [{}];
                    } else if (!Array.isArray(updateData.appearance)) {
                        updateData.appearance = [updateData.appearance];
                    }
                    
                    // Ensure first element exists
                    if (!updateData.appearance[0]) {
                        updateData.appearance[0] = {};
                    }
                    
                    // Set the file path
                    updateData.appearance[0].instituteLogo = logoFile.path;
                    
                    // Delete old logo if it exists
                    if (existingInstitution?.appearance?.[0]?.instituteLogo) {
                        deleteOldFile(existingInstitution.appearance[0].instituteLogo);
                    }
                }
                
                // Process ProofOfIdentity
                if (req.files['ProofOfIdentity']) {
                    const identityFile = req.files['ProofOfIdentity'][0];
                    
                    // Ensure instituteDocuments array exists
                    if (!updateData.instituteDocuments) {
                        updateData.instituteDocuments = [{}];
                    } else if (!Array.isArray(updateData.instituteDocuments)) {
                        updateData.instituteDocuments = [updateData.instituteDocuments];
                    }
                    
                    // Ensure first element exists
                    if (!updateData.instituteDocuments[0]) {
                        updateData.instituteDocuments[0] = {};
                    }
                    
                    // Set the file path
                    updateData.instituteDocuments[0].ProofOfIdentity = identityFile.path;
                    
                    // Delete old identity proof if it exists
                    if (existingInstitution?.instituteDocuments?.[0]?.ProofOfIdentity) {
                        deleteOldFile(existingInstitution.instituteDocuments[0].ProofOfIdentity);
                    }
                }
                
                // Process ProofOfAddress
                if (req.files['ProofOfAddress']) {
                    const addressFile = req.files['ProofOfAddress'][0];
                    
                    // Ensure instituteDocuments array exists
                    if (!updateData.instituteDocuments) {
                        updateData.instituteDocuments = [{}];
                    } else if (!Array.isArray(updateData.instituteDocuments)) {
                        updateData.instituteDocuments = [updateData.instituteDocuments];
                    }
                    
                    // Ensure first element exists
                    if (!updateData.instituteDocuments[0]) {
                        updateData.instituteDocuments[0] = {};
                    }
                    
                    // Set the file path
                    updateData.instituteDocuments[0].ProofOfAddress = addressFile.path;
                    
                    // Delete old address proof if it exists
                    if (existingInstitution?.instituteDocuments?.[0]?.ProofOfAddress) {
                        deleteOldFile(existingInstitution.instituteDocuments[0].ProofOfAddress);
                    }
                }
            }

            // Ensure all array fields are properly formatted
            const ensureArray = (data, field) => {
                if (data[field] && !Array.isArray(data[field])) {
                    data[field] = [data[field]];
                }
            };

            // Ensure all array fields are arrays
            ensureArray(updateData, 'instituteDetails');
            ensureArray(updateData, 'aboutInstitution');
            ensureArray(updateData, 'instituteAddress');
            ensureArray(updateData, 'appearance');
            ensureArray(updateData, 'socialLinks');
            ensureArray(updateData, 'InstitutePersonalInfo');
            ensureArray(updateData, 'instituteDocuments');
            ensureArray(updateData, 'MailingAddress');
            ensureArray(updateData, 'AccountManagerDetails');

            console.log("Final update data:", JSON.stringify(updateData, null, 2));

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
            
            // Clean up uploaded files if there was an error
            if (req.files) {
                Object.values(req.files).flat().forEach(file => {
                    deleteOldFile(file.path);
                });
            }
            
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: Object.values(error.errors).map(err => err.message)
                });
            }

            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    message: "Invalid data format",
                    error: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
);

export default router;