const express = require('express')
const controller = require('./controller')

const filmRouter = express.Router()
filmRouter.get('/', controller.home)
filmRouter.get('/search', controller.search)
filmRouter.get('/filmdetail/:slug', controller.detail)

module.exports = filmRouter
