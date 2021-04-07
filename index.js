const express = require('express')
const mysql = require('mysql')
const es6Renderer = require('express-es6-template-engine')
const filmRoute = require('./modules/film/_index')

const app = express()

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'cms_betv'
})

db.connect((err) => {
  if (err) {
    console.log('Cant connect to database')
  } else {
    console.log('Connected to database')
  }  
})
global.db = db

app.engine('html', es6Renderer)
app.set('views', 'views')
app.set('view engine', 'html')
app.use(express.static('public'))

app.use('/', filmRoute)

app.listen(8080)
