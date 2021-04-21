const { env: { API_URL }} = process

const fetch = require('node-fetch')
const getApiToken = require('./get-api-token')

module.exports = function searchClients(requesterUserId, limit = 10, name) {
    if(Number.isNaN(limit)) throw new TypeError('limit must be a number')
    if(typeof requesterUserId !== 'string') throw new TypeError('requesterUserId must be a string')

    return (async () => {
        const getClients = async () => fetch(`${API_URL}/clients`, {
            headers: {
                'Authorization': `Bearer ${await getApiToken()}`
            }
        })

        const getPolicies = async () => fetch(`${API_URL}/policies`, {
            headers: {
                'Authorization': `Bearer ${await getApiToken()}`
            }
        })

        return Promise.all([getClients(), getPolicies()])
            .then(async ([clientsResponse, policiesResponse]) => {
                if(clientsResponse.status === 401 || policiesResponse.status === 401) throw new Error('api token expired')

                let clients = await clientsResponse.json()
                const policies = await policiesResponse.json()

                const requesterUser = clients.find(client => client.id === requesterUserId)

                if(requesterUser.role === 'user') {
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

                clients = clients.reduce((acc, client) => {
                    if(name) {
                        if(client.name.toLowerCase() === name.toLowerCase()) {
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
                    } else {
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

                        return acc
                    }
                }, [])

                return clients.slice(0, limit)
            })
    })()
}