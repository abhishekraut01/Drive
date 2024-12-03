import express from 'express';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
const router = express.Router();

import upload from '../Config/multer.config.js'; // Multer config for handling file uploads
import supabase from '../Config/supabase.config.js'; // Supabase client setup

import filesModel from '../models/files.model.js';
import authMiddleware from '../middlewares/auth.js';

// Route to render the home page
router.get('/home', authMiddleware, (req, res) => {
    res.render('home');
});

// Route to handle file uploads
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    const clientFile = req.file;

    if (!clientFile) {
        return res.status(400).send('No file uploaded.');
    }

    if (!req.user || !req.user.id) {
        return res.status(400).send('User is not authenticated or user ID is missing.');
    }

    try {
        // Generate a unique file name
        const uniqueFileName = `${uuidv4()}-${clientFile.originalname}`;

        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
            .from('drive')
            .upload(`uploads/${uniqueFileName}`, clientFile.buffer, {
                contentType: clientFile.mimetype,
            });

        if (error) {
            console.error('Error uploading file:', error);
            return res.status(500).send('Failed to upload file.');
        }

        // Generate a signed URL (if private bucket)
        const { signedURL, error: urlError } = await supabase.storage
            .from('drive')
            .createSignedUrl(`uploads/${uniqueFileName}`, 60);

        if (urlError) {
            console.error('Error generating signed URL:', urlError);
            return res.status(500).send('Failed to generate signed URL.');
        }

        // Save file details to the database
        const newFile = await filesModel.create({
            originalname: clientFile.originalname, // Ensure the spelling matches schema
            path: uniqueFileName,
            user: req.user.id,
        });

        // Send a single response containing all details
        res.status(201).json({
            message: 'File uploaded successfully!',
            fileUrl: signedURL,
            fileDetails: newFile,
        });
    } catch (err) {
        console.error('Unexpected error during file upload:', err);
        res.status(500).send('Server error during file upload.');
    }
});




export default router;

