const { env: { API_URL }} = process

const fetch = require('node-fetch')
const getAPIToken = require('./get-api-token')

/**
 * fetches own user in case of 'user' user or all users in case of 'admin' user
 * 
 * @param {String} requesterUserId the id of the user is searching clients
 * @param {Number} limit clients per page - Default 10
 * @param {String} name Optional - the name for searching
 * 
 * @throws {TypeError} if requesterUserId is not a string
 * @throws {TypeError} if limit is not a number
 * @throws {TypeError} if name is not a string
 * 
 * @returns {Promise<Array>} users that match the query
 */

module.exports = function searchClients(requesterUserId, limit = 10, name) {
    if(typeof requesterUserId !== 'string') throw new TypeError('requesterUserId must be a string')
    if(Number.isNaN(limit)) throw new TypeError('limit must be a number')
    if(name && typeof name !== 'string') throw new TypeError('name must be a string')

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

                let clients = await clientsResponse.json()
                const policies = await policiesResponse.json()

                const requesterUser = clients.find(client => client.id === requesterUserId)
                if(!requesterUser) throw new Error('unauthorized')

                if(requesterUser.role === 'admin') {
                    clients = clients.reduce((acc, client) => {
                        if(!name || client.name.toLowerCase() === name.toLocaleLowerCase()) {
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
                } else {
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

                return clients.slice(0, limit)
            })
    })()
}