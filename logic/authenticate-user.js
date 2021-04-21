require('dotenv').config()
const { env: { API_URL }} = process

const fetch = require('node-fetch')
const { jwtPayloadExtractor } = require('../utils')

/**
 * 
 * @param {string} username user's username
 * @param {string} password user's password
 * 
 * @throws {TypeError} if username is not a string
 * @throws {TypeError} if password is not a string
 * 
 * @returns {Promise<string>} the user's id
 */

module.exports = function authenticateUser(username, password) {
    if(typeof username !== 'string') throw new TypeError(`username ${username} is not a string`)
    if(typeof password !== 'string') throw new TypeError(`password ${password} is not a string`)

    return (async () => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({
                client_id: username,
                client_secret: password
            }),
            headers:{
                'Content-Type': 'application/json'
            }
        })

        const { token, error } = await response.json()
        
        if(error) throw new Error(error)
        
        const { clientId: userId } = jwtPayloadExtractor(token)

        return userId
    })()

}