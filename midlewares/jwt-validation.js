const jwt = require('jsonwebtoken')
const { env: { JWT_SECRET } } = process

module.exports = (req, res, next) => {
    const { headers: { authorization } } = req

    if (!authorization) return res
        .status(401)
        .json({
            code: 401,
            message: 'no authorization token provided'
        })

    const [bearer, token] = authorization.split(' ')

    if (bearer.toLowerCase() !== 'bearer') return res
        .status(401)
        .json({
            code: 401,
            message: 'invalid authorization header'
        })

    if (!token) return res
        .status(401)
        .json({
            code: 401,
            message: 'not token provided'
        })

    try {
        const payload = jwt.verify(token, JWT_SECRET)

        req.requesterUser = payload.sub

        next()
    } catch ({ message }) {
        res
            .status(401)
            .json({
                code: 401,
                message
            })
    }
}