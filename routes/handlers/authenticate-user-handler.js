const { env: { JWT_SECRET, JWT_EXP } } = process

const jwt = require('jsonwebtoken')
const { authenticateUser } = require('../../logic')

module.exports = async function authenticateUserHandler(req, res) {
    const { username, password } = req.body

    try {
        const userId = await authenticateUser(username, password)

        const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXP })

        // const token = jwt.sign({ sub: 'a3b8d425-2b60-4ad7-becc-bedf2ef860bd' }, JWT_SECRET, { expiresIn: JWT_EXP }) // User
        // const token = jwt.sign({ sub: 'a0ece5db-cd14-4f21-812f-966633e7be86' }, JWT_SECRET, { expiresIn: JWT_EXP }) // Admin

        res
            .status(200)
            .json({ token, type: 'bearer', expires_in: JWT_EXP })
    } catch(error) {
        if(error.message === 'Unauthorized') {
            res
                .status(401)
                .json({
                    code: 401,
                    message: 'wrong credentials'
                })
        } else {
            res
                .status(400)
                .json({
                    code: 400,
                    message: error.message
                })
        }
    }
}