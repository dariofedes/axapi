const { env: { API_URL }} = process

const fetch = require('node-fetch')
const getAPIToken = require('./get-api-token')

/**
 * retrieves all the policies in data source
 * 
 * @param {String} requesterUserId the id of the user is searching clients
 * @param {Number} limit clients per page - Default 10
 * 
 * @throws {TypeError} if requesterUserId is not a string
 * @throws {TypeError} if limit is not a number
 * 
 * @returns {Promise<Array>} policies in data source
 */

module.exports = function searchClients(requesterUserId, limit = 10) {
    if(typeof requesterUserId !== 'string') throw new TypeError('requesterUserId must be a string')
    if(Number.isNaN(limit)) throw new TypeError('limit must be a number')

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
                let policies = await policiesResponse.json()

                const requesterUser = clients.find(client => client.id === requesterUserId)
                if(!requesterUser) throw new Error('unauthorized')

                if(requesterUser.role === 'admin') {
                    policies = policies.map(policy => ({
                        id: policy.id,
                        amountInsured: policy.amountInsured,
                        email: policy.email,
                        inceptionDate: policy.inceptionDate,
                        installmentPayment: policy.installmentPayment
                    }))
                } else {
                    policies = policies.reduce((acc, policy) => {
                        if(policy.clientId === requesterUser.id) {
                            acc.push({
                                id: policy.id,
                                amountInsured: policy.amountInsured,
                                email: policy.email,
                                inceptionDate: policy.inceptionDate,
                                installmentPayment: policy.installmentPayment
                            })
                        }

                        return acc
                    }, [])
                }

                return policies.slice(0, limit)
            })
    })()
}