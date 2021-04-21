const { env: { API_URL }} = process

const fetch = require('node-fetch')
const getAPIToken = require('./get-api-token')

/**
 * retrieves the given id client's policies
 * 
 * @param {String} requesterUserId the id of the user is searching clients
 * @param {String} id the id of the requested user
 * 
 * @throws {TypeError} if requesterUserId is not a string
 * @throws {TypeError} if id is not a string
 * 
 * @returns {Promise<Array>} User policies
 */

module.exports = function retrieveClientPolicies(requesterUserId, id) {
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

                const user = clients.find(client => client.id === id)
                if(!user) throw new Error('not found')

                const clientPolicies = policies.reduce((acc, policy) => {
                    if(policy.clientId === id) {
                        acc.push({
                            id: policy.id,
                            amountInsured: policy.amountInsured,
                            inceptionDate: policy.inceptionDate,
                            installmentPayment: policy.installmentPayment
                        })
                    }

                    return acc
                }, [])

                return clientPolicies
            })
    })()
}