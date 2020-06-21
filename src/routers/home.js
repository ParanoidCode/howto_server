const express = require ('express')
const router = new express.Router()
router.get('/', (req,res)=>{
    res.render('index',{
        title: 'Healtcare Web Services',
    })
})

router.get('*', (req, res)=>{
    res.send('404 Error page')
})
module.exports = router