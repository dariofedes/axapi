const { env: { API_URL }} = process

const fetch = require('node-fetch')
const getAPIToken = require('./get-api-token')

/**
 * retrieves the given id policy
 * 
 * @param {String} requesterUserId the id of the user is requesting the policy
 * @param {String} id the id of the requested policy
 * 
 * @throws {TypeError} if requesterUserId is not a string
 * @throws {TypeError} if id is not a string
 * 
 * @returns {Promise<Array>} policy info
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

                const policy = policies.find(policy => policy.id === id)
                if(requesterUser.role !== 'admin' && requesterUserId !== policy?.clientId) throw new Error('forbidden')
                if(!policy) throw new Error('not found')

                return policy
            })
    })()
}