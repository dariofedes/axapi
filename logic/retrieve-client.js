const { env: { API_URL }} = process

const fetch = require('node-fetch')
const getAPIToken = require('./get-api-token')

/**
 * retrieves the given id client
 * 
 * @param {String} requesterUserId the id of the user is searching clients
 * @param {String} id the id of the requested user
 * 
 * @throws {TypeError} if requesterUserId is not a string
 * @throws {TypeError} if id is not a string
 * 
 * @returns {Promise<Array>} User info
 */

module.exports = function retrieveClient(requesterUserId, id) {
    if(typeof requesterUserId !== 'string') throw new TypeError('requesterUserId must be a string')
    if(typeof id !== 'string') throw new TypeError('id must be a string')

    return (async () => {
        const getClients = async () => fetch(`${API_URL}/clients`, {
            headers: {
                'Authorization': `Bearer ${await getAPIToken()}`
            }
        })

        const getPolicies = async () => fetch(`${API_URL}/policies`, {
            headers: {
                'Authorization': `Bearer ${await getAPIToken()}`
            }
        })

        return Promise.all([getClients(), getPolicies()])
            .then(async ([clientsResponse, policiesResponse]) => {
                if(clientsResponse.status === 401 || policiesResponse.status === 401) throw new Error('api token expired')

                const clients = await clientsResponse.json()
                const policies = await policiesResponse.json()

                const requesterUser = clients.find(client => client.id === requesterUserId)
                if(!requesterUser) throw new Error('unauthorized')
                if(requesterUser.id !== id && requesterUser.role !== 'admin') throw new Error('forbidden')

                const client = requesterUser.id === id ? requesterUser : clients.find(client => client.id === id)
                if(!client) throw new Error('not found')

                client.policies = policies.reduce((acc, cur) => {
                    if(cur.clientId === id) {
                        acc.push({
                            id: cur.id,
                            amountInsured: cur.amountInsured,
                            inceptionDate: cur.inceptionDate
                        })
                    }

                    return acc
                }, [])


                return client
            })
    })()
}