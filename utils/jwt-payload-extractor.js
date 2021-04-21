const atob = require('atob')

/**
 * Gets a json web token and returns the payload parsed to plain object
 * 
 * @param {string} token the token to stract payload
 * 
 * @throws {TypeError} if token is not a string
 * 
 * @returns {Object} the payload parsed to plain object
 */

module.exports = function jwtPayloadExtractor(token) {
    if(typeof token !== 'string') throw new TypeError(`token ${token} is not a string`)

    const payload = token.split('.')[1]

    return JSON.parse(atob(payload))
}