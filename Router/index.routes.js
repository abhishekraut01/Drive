import express from 'express';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
const router = express.Router();

import upload from '../Config/multer.config.js'; // Multer config for handling file uploads
import supabase from '../Config/supabase.config.js'; // Supabase client setup

import filesModel from '../models/files.model.js';
import authMiddleware from '../middlewares/auth.js';
import userModel from '../models/user.js';

// Route to render the home page
router.get('/home', authMiddleware, async (req, res) => {

    const userFiles = await filesModel.find({
        user: req.user.id
    })


    res.render('home', {
        files: userFiles
    });
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

router.get('/download/:path', authMiddleware, async (req, res) => {
    try {
        console.log('Request params:', req.params);
        console.log('Authenticated user:', req.user);

        const path = req.params.path;
        const loggedInUserId = req.user.id;

        // Check if the file exists in the database
        const file = await filesModel.findOne({
            path,
            user: loggedInUserId,
        });

        if (!file) {
            console.error('File not found in database.');
            return res.status(404).send('File not found.');
        }

        console.log('File found in database:', file);

        // Generate signed URL
        const { signedURL, error: urlError } = await supabase.storage
            .from('drive')
            .createSignedUrl(`uploads/${file.path}`, 60);

        if (urlError || !signedURL) {
            console.error('Error generating signed URL:', urlError || 'No signed URL generated.');
            return res.status(500).send('Failed to generate signed URL.');
        }

        console.log('Generated signed URL:', signedURL);

        // Redirect to the signed URL
        res.redirect(signedURL);
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send('An error occurred while processing your request.');
    }
});



export default router;

