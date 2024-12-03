import express from 'express';
const router = express.Router();

import upload from '../Config/multer.config.js'; // Multer config for handling file uploads
import supabase from '../Config/supabase.config.js'; // Supabase client setup

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
        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
            .from('drive') // Replace 'drive' with your actual bucket name
            .upload(`uploads/${clientFile.originalname}`, clientFile.buffer, {
                contentType: clientFile.mimetype,
                upsert: true, // Overwrites if file already exists
            });

        if (error) {
            console.error('Error uploading file:', error);
            return res.status(500).send('Failed to upload file.');
        }

        // Generate a signed URL (for private buckets)
        const { signedURL, error: urlError } = await supabase.storage
            .from('drive') // Same bucket name
            .createSignedUrl(`uploads/${clientFile.originalname}`, 60); // 60 seconds expiry time

        // Log errors if any
        console.log('Signed URL:', signedURL);
        console.log('Signed URL Error:', urlError);

        if (urlError) {
            console.error('Error generating signed URL:', urlError);
            return res.status(500).send('Failed to generate signed URL.');
        }


    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send('Server error during file upload.');
    }
});


export default router;

