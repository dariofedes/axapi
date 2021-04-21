const { Router } = require('express')
const bodyParser = require('body-parser')
const { jwtValidation } = require('../midlewares')
const {
    authenticateUserHandler,
    searchClientsHandler,
    retrieveClientHandler,
    retrieveClientPoliciesHandler,
    retrievePoliciesHandler,
} = require('./handlers')

const router = new Router()
const jsonBodyParser = bodyParser.json()


router.post('/login', jsonBodyParser, authenticateUserHandler)
router.get('/clients', jwtValidation, searchClientsHandler)
router.get('/clients/:id', jwtValidation, retrieveClientHandler)
router.get('/clients/:id/policies', jwtValidation, retrieveClientPoliciesHandler)
router.get('/policies', jwtValidation, retrievePoliciesHandler)

module.exports = router