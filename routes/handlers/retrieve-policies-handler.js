const { retrievePolicies } = require('../../logic')
const Storage = require('../../Storage')

module.exports = function retrievePoliciesHandler(req, res) {
    const { query: { limit }, requesterUser } = req

    let attempts = 0

    return (async function tryRetrievePolicies() {
        try {
            const policies = await retrievePolicies(requesterUser, limit && parseInt(limit))
    
            res
                .status(200)
                .json(policies)
        } catch({ message }) {
            if(message === 'api token expired' && attempts < 3) {
                attempts++

                Storage.token = null

                return await tryRetrievePolicies()
            }

            if(message === 'unauthorized') {
                res
                    .status(401)
                    .json({
                        code: 401,
                        message: 'Unauthorized user'
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