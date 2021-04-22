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
            if(message === 'api token expired') {
                if(attempts < 3) {
                    attempts++

                    Storage.token = null

                    return await tryRetrieveClient()
                } else {
                    res
                        .status(500)
                        .json({
                            code: 500,
                            message: 'Internal Server error'
                        })
                }
            } else if(message === 'unauthorized') {
                res
                    .status(401)
                    .json({
                        code: 401,
                        message: 'Unauthorized user'
                    })
            } else {
                res
                    .status(400)
                    .json({
                        code: 400,
                        message
                    })
            }
        }
    })()
}