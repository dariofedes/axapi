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

module.exports = function retrieveClients(requesterUserId, id) {
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

                if(requesterUser.role === 'user') {
                    if(requesterUser.id !== id) throw new Error('forbidden')

                    requesterUser.policies = policies.reduce((acc, cur) => {
                        if(cur.clientId === requesterUser.id) {
                            acc.push({
                                id: cur.id,
                                amountInsured: cur.amountInsured,
                                inceptionDate: cur.inceptionDate
                            })
                        }

                        return acc
                    }, [])

                    return [requesterUser]
                }

                const client = clients.reduce((acc, client) => {
                        if(client.id === id) {
                            client.policies = policies.reduce((acc, policy) => {
                                if(policy.clientId === client.id) {
                                    acc.push( {
                                        id: policy.id,
                                        amountInsured: policy.amountInsured,
                                        inceptionDate: policy.inceptionDate
                                    })
                                }

                                return acc
                            }, [])

                            acc.push(client)
                        }

                        return acc
                }, [])

                if(!client.length) throw new Error('not found')

                return client
            })
    })()
}