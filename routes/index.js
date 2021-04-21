const { Router } = require('express')
const bodyParser = require('body-parser')
const {
    authenticateUserHandler
} = require('./handlers')

const router = new Router()
const jsonBodyParser = bodyParser.json()

router.post('/login', jsonBodyParser, authenticateUserHandler)

module.exports = router