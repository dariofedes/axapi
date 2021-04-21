const { retrieveClientPolicies } = require('../../logic')
const Storage = require('../../Storage')

module.exports = function retrieveClientPoliciesHandler(req, res) {
    const { params: { id }, requesterUser } = req

    let attempts = 0

    return (async function tryRetrieveClientolicies() {
        try {
            const clientPolicies = await retrieveClientPolicies(requesterUser, id)
    
            res
                .status(200)
                .json(clientPolicies)
        } catch({ message }) {
            if(message === 'api token expired' && attempts < 3) {
                attempts++

                Storage.token = null

                return await tryRetrieveClientPolicies()
            }

            if(message === 'unauthorized') {
                res
                    .status(401)
                    .json({
                        code: 401,
                        message: 'Unauthorized user'
                    })
            }

            if(message === 'forbidden') {
                res
                    .status(403)
                    .json({
                        code: 403,
                        message: `You dont have permission to retrieve user with id ${id}`
                    })
            }

            if(message === 'not found') {
                res
                    .status(404)
                    .json({
                        code: 404,
                        message: `User with id ${id} not found`
                    })
            }

            res
                .status(400)
                .json({
                    code: 400,
                    message
                })
        }
    })()
}