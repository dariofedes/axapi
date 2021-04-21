const { expect: chaiExpect } = require('chai')
const getAPIToken = require('./get-api-token')

//Dependencies to mock
jest.mock('node-fetch')
const fetch = require('node-fetch')
const Storage = require('../Storage')

describe('getAPIToken', () => {
    const token = 'a feke token'

    describe('on existing token', () => {
        beforeAll(() => {
            Storage.token = token
        })

        it('should not fail', async () => {
            let error

            try {
                await getAPIToken()
            } catch(_error) {
                error = _error
            }

            chaiExpect(error).not.to.exist
        })

        it('should return the token', async () => {
            const response = await getAPIToken()

            chaiExpect(response).to.be.equal(token)
        })

        it('should return a string', async () => {
            const response = await getAPIToken()

            chaiExpect(response).to.be.a('string')
        })

        it('should not fetch a new token', async () => {
            await getAPIToken()

            expect(fetch).not.toHaveBeenCalled()
        })

        afterAll(() => {
            Storage.token = null
        })
    })

    describe('on non existing token', () => {
        let json

        beforeAll(() => {
            json = jest.fn(() => ({ token }))
            fetch.mockReturnValue({ json })
        })

        beforeEach(() => {
            Storage.token = null
        })

        it('should not fail', async () => {
            let error

            try {
                await getAPIToken()
            } catch(_error) {
                error = _error
            }

            chaiExpect(error).not.to.exist
        })

        it('should return the token', async () => {
            const response = await getAPIToken()

            chaiExpect(response).to.be.equal(token)
        })

        it('should return a string', async () => {
            const response = await getAPIToken()

            chaiExpect(response).to.be.a('string')
        })

        it('should fetch a new token', async () => {
            await getAPIToken()

            expect(fetch).toHaveBeenCalled()
        })        

        afterEach(() => {
            Storage.token = null
        })

        afterAll(() => {
            json.mockClear()
            fetch.mockClear()
        })
    })
})