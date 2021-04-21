const { Router } = require('express')
const bodyParser = require('body-parser')
const { jwtValidation } = require('../midlewares')
const {
    authenticateUserHandler,
    searchClientsHandler,
} = require('./handlers')

const router = new Router()
const jsonBodyParser = bodyParser.json()


router.post('/login', jsonBodyParser, authenticateUserHandler)
router.get('/clients', jwtValidation, searchClientsHandler)

module.exports = router