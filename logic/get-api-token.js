const { env: { API_URL, USERNAME, PASSWORD }} = process

const fetch = require('node-fetch')
const Storage = require('../Storage')

/**
 * Authenticates and retrieves an authorization token for using the main API
 * 
 * @returns {Promise<string>} The authorization token
 */

module.exports = async function getAPIToken() {
    if(Storage.token) return Storage.token

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({
            client_id: USERNAME,
            client_secret: PASSWORD
        }),
        headers:{
            'Content-Type': 'application/json'
        }
    })

    const { token } = await response.json()

    Storage.token = token

    return token
}