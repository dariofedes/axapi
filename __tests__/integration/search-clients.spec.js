require('dotenv').config()

const { expect: chaiExpect } = require('chai')
const { searchClientsHandler } = require('../../routes/handlers')
const Storage = require('../../Storage')

const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImRhcmUiLCJpYXQiOjE2MTkwMDAwMjEsImV4cCI6MTYxOTAwMDYyMX0.6tCBfTOJ6tiEHRNBzAb_LUZy1344AjFDCCG15SHNZBM'
const userId = '147c193f-98e3-40fa-a7d3-18ac72518829'
let req = { }
let res = { }
let json

describe('searchClients -- Integration', () => {
    describe('on expired API token', () => {
        beforeEach(() => {
            Storage.token = expiredToken

            req.query = { }
            req.requesterUser = userId

            json = jest.fn()
            res.status = jest.fn(() => ({ json }))
        })

        it('should not fail or throw', async () => {
            let error

            try {
                await searchClientsHandler(req, res)
            } catch (_error) {
                error = _error
            }

            chaiExpect(error).not.to.exist
            expect(res.status).not.toHaveBeenCalledWith(400)
        })

        it('should send an http response with status 200', async () => {
            await searchClientsHandler(req, res)

            expect(json).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
        })

        it('should retrieve a new API token', async () => {
            await searchClientsHandler(req, res)

            chaiExpect(Storage.token).not.to.be.equal(expiredToken)
        })

        afterEach(() => {
            Storage.token = null

            req = { }
            res = { }
            json.mockClear()
        })
    })
})