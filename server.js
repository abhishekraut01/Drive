import express from 'express';
import dotenv from 'dotenv';
import userRouter from './Router/user.routes.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

// Set up EJS as the view engine
app.set('view engine', 'ejs');

app.get('/' , (req , res)=>{
   res.render('index')
})

app.use('/user', userRouter);

app.listen(port, () => console.log('> Server is up and running on port: ' + port));
