const { searchClients } = require('../../logic')
const Storage = require('../../Storage')

module.exports = function searchClientsHandler(req, res) {
    const { query: { limit, name }, requesterUser } = req

    let attempts = 0

    return (async function trySearchClients() {
        try {
            const clients = await searchClients(requesterUser, limit && parseInt(limit), name)
    
            res
                .status(200)
                .json(clients)
        } catch({ message }) {
            if(message === 'api token expired' && attempts < 3) {
                attempts++

                Storage.token = null

                return await trySearchClients()
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