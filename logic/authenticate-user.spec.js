const { expect } = require('chai')
const authenticateUser = require('./authenticate-user')

//Dependencies to mock
jest.mock('node-fetch')
const fetch = require('node-fetch')

const userId = 'a0ece5db-cd14-4f21-812f-966633e7be86'
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMGVjZTVkYi1jZDE0LTRmMjEtODEyZi05NjY2MzNlN2JlODYiLCJpYXQiOjE2MTkwMjEwODUsImV4cCI6MTYxOTAyNDY4NX0.wZ3OGQIvraUlKYEGPEUQr7oPUCzrH4iPdQ7MygQdfTc'
let json, username = 'fakeUsername', password = 'fakePassword'

describe('authenticateUser', () => {
    describe('on valid arguments', () => {
        describe('on correct credentials', () => {
            beforeEach(() => {
                json = jest.fn(() => ({ token }))
                fetch.mockReturnValue(({ json }))
            })
    
            it('should not throw', async () => {
                let error
    
                try {
                    await authenticateUser(username, password)
                } catch(_error) {
                    error = _error
                }
    
                expect(error).not.to.exist
            })
    
            it('should return a string with the userId', async () => {
                const userId = await authenticateUser(username, password)
    
                expect(userId).to.be.a('string')
                expect(userId).to.be.equal(userId)
            })
            
            afterAll(() => {
                json.mockClear()
                fetch.mockClear()
            })
        })

        describe('on fetching error or wrong credentials', () => {
            beforeEach(() => {
                json = jest.fn(() => ({ error: 'fakeError' }))
                fetch.mockReturnValue(({ json }))
            })
    
            it('should throw', async () => {
                let error
    
                try {
                    await authenticateUser(username, password)
                } catch(_error) {
                    error = _error
                }
    
                expect(error).to.exist
            })

            it('should throw an instance of Error', async () => {
                let error
    
                try {
                    await authenticateUser(username, password)
                } catch(_error) {
                    error = _error
                }
    
                expect(error).to.be.an.instanceof(Error)
            })

            it('should throw an Error with the message passed from fetch', async () => {
                let error
    
                try {
                    await authenticateUser(username, password)
                } catch(_error) {
                    error = _error
                }
    
                expect(error.message).to.be.equal('fakeError')
            })
            
            afterAll(() => {
                json.mockClear()
                fetch.mockClear()
            })
        })
    })

    describe('on non valid arguments', () => {
        it('should throw sync TypeError on non string username', () => {
            username = 1
            expect(() => authenticateUser(username, password)).to.throw(TypeError, `username 1 is not a string`)
            username = true
            expect(() => authenticateUser(username, password)).to.throw(TypeError, `username true is not a string`)
            username = undefined
            expect(() => authenticateUser(username, password)).to.throw(TypeError, `username undefined is not a string`)
            username = null
            expect(() => authenticateUser(username, password)).to.throw(TypeError, `username null is not a string`)
        })

        it('should throw sync TypeError on non string password', () => {
            password = 1
            expect(() => authenticateUser(username, password)).to.throw(TypeError, `password 1 is not a string`)
            password = true
            expect(() => authenticateUser(username, password)).to.throw(TypeError, `password true is not a string`)
            password = undefined
            expect(() => authenticateUser(username, password)).to.throw(TypeError, `password undefined is not a string`)
            password = null
            expect(() => authenticateUser(username, password)).to.throw(TypeError, `password null is not a string`)
        })

        afterEach(() => {
            username = 'fakeUsername'
            passwod = 'fakePassword'
        })
    })
})