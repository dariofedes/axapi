const { env: { JWT_SECRET, JWT_EXP } } = process

const jwt = require('jsonwebtoken')
const { authenticateUser } = require('../../logic')

module.exports = async function authenticateUserHandler(req, res) {
    const { username, password } = req.body

    try {
        const userId = await authenticateUser(username, password)

        const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXP })

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