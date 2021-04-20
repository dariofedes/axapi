require('dotenv').config()
const { env: { API_URL, USERNAME, PASSWORD }} = process

const fetch = require('node-fetch')
const Storage = require('../Storage')

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

    const data = await response.json()

    Storage.token = data.token

    return data.token
}