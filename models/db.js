import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/Drive';

const dbConnection = ()=>{
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB connected!'))
        .catch(err => console.error('Connection error:', err));
} 

export default dbConnection