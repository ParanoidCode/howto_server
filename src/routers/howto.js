const express = require('express')
const Howto = require('../models/howto')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()


const regexString = function(string){
    let split = string.split(',')
    let result = []
    let i = 0;
    for(i= 0; i<split.length; i++){
        result.push('(?=.*'+split[i]+')')
    }
    result = result.toString().replace(',','')
    return result
}

/*****************************
 * AUTH API
 * ***************************
 */


router.get('/api/me/:slug', auth, (req, res)=>{
    const slug = req.params.slug
    Howto.findOne({owner:req.user._id,  slug: slug}).then((result)=>{
        res.send(result)
    }).catch((e)=>{
        res.status(500).send("Error")
    })
})

router.get('/api/me', auth, (req, res)=>{
    Howto.find({owner: req.user._id}).then((results)=>{
        res.send(results)
    }).catch((e)=>{
        res.status(404).send("Error")
    })
})


router.post('/api/insert', auth, (req,res)=>{
    const howto = new Howto({
        ...req.body,
        owner: req.user._id
    })

    howto.save().then((howto)=>{
        res.status(201).send(howto)
    }).catch((e)=>{
        res.status(500).send(e)
    })

})

router.put('/api/edit/:slug', auth, (req,res)=>{
    const slug = req.params.slug
    Howto.updateOne({owner:req.user._id, slug:slug}, req.body).then((result)=>{
        res.send(result)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

router.delete('/api/remove/:slug', auth, (req,res)=>{
    const slug = req.params.slug
    Howto.remove({owner:req.user._id ,slug:slug}).then((result)=>{
        res.send(JSON.stringify((result)))
    }).catch((e)=>{
        console.log("Error")
        res.status(500).send(e)
    })
})

/***********************
 * Public API
 * *********************
 */

router.get('/api/global', (req, res)=>{
    let query = ""
    let tags = ""
    if(req.query.tags === undefined){
        res.status(400).send("Error: Query is empty")
    }
    else {
        query = req.query.tags
        tags = regexString(query)

        Howto.find({tags: {$regex: `^${tags}.*$`, $options: "si"}}).then((howto) => {
            let items = []
            howto.forEach((item) => {
                console.log(item.owner)
                const name = User.findOne({username: item.username}).getQuery('username')
                items.push({
                    username: name.username,
                    title: item.title,
                    description: item.description,
                    tags: item.tags,
                    slug: item.slug
                })
            })
            res.send(items)
        }).catch((e) => {
            res.status(500).send(e)
        })
    }
})



router.get('/api/user/:username', (req, res)=>{
        let query = {}
        User.findOne({username: req.params.username}).then((user) => {
            if(req.query.tags === undefined){
                query = {owner: user._id}
            }else{
                const tags = req.query.tags
                query = {tags: {$regex: `^${tags}.*$`, $options: "si"}}
            }
            Howto.find(query).then((results) => {
                res.send(results)
            }).catch((e) => {
                res.status(400).send("Error: content empty")
            })
        }).catch((e) => {
            res.status(400).send("Error: user not found")
        })

})
router.get('/api/user/:username/:slug', (req, res)=>{
    const slug = req.params.slug
    User.findOne({username: req.params.username}).then((user) => {
        Howto.findOne({owner: user._id, slug: slug}).then((result)=>{
            res.send(result)
        }).catch((e)=>{
            res.status(500).send(e)
        })
    }).catch((e)=>{
        res.status(500).send(e)
    })
})



module.exports = router