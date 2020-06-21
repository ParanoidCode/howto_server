const path = require('path')
const express = require('express')
const hbs = require('express-hbs')
var bodyParser = require('body-parser');
require('./db/mongoose')
const userRouter = require('./routers/user')
const howtoRouter = require('./routers/howto')


const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(userRouter)
app.use(howtoRouter)

app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
const publicDirPath = path.join(__dirname, '../public')

app.set('view engine', 'hbs')
app.use(express.static(publicDirPath))



app.listen(3000, ()=>{
    console.log('Server is up on port 3000')
})

