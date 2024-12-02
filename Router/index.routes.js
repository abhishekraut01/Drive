const express = require('express')
const app = express()
const router = express.Router(); 

router.get('/home', (req, res) => {
    res.render('index')
})


export default router

