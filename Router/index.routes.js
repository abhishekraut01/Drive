import express from 'express';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
const router = express.Router();

import upload from '../Config/multer.config.js'; // Multer config for handling file uploads
import supabase from '../Config/supabase.config.js'; // Supabase client setup

import filesModel from '../models/files.model.js';

// Route to render the home page
router.get('/home', (req, res) => {
    res.render('home');
});

// Route to handle file uploads
router.post('/upload', upload.single('file'), async (req, res) => {
    const clientFile = req.file;

    if (!clientFile) {
        return res.status(400).send('No file uploaded.');
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

        // Generate a signed URL (for private buckets)
        const { signedURL, error: urlError } = await supabase.storage
            .from('drive') // Same bucket name
            .createSignedUrl(`uploads/${uniqueFileName}`, 60); // 60 seconds expiry time

        if (urlError) {
            console.error('Error generating signed URL:', urlError);
            return res.status(500).send('Failed to generate signed URL.');
        }

        res.status(200).send({
            message: 'File uploaded successfully!',
            fileUrl: signedURL,
        });

    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send('Server error during file upload.');
    }
});



export default router;

