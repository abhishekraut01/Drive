import express from 'express'; 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config()

const app = express();
app.use(express.json()); // Parse incoming JSON requests

// Supabase setup
const supabaseUrl = 'https://lkzmkvoqrwefaihvuaxi.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_KEY; // Get this from your dashboard

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
// Export the client
export default supabase;