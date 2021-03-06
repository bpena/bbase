import Debug from 'debug'
import { secret } from '../config'
import jwt from 'jsonwebtoken'

const debug = new Debug('server::auth-middleware')

export const required = (req, res, next) => {
    jwt.verify(req.headers.token, secret, (err, token) => {
        if (err) {
            debug('JWT was not encrypted with our secret')
            return res.status(401).json({
                message: 'Unauthorized',
                error: err,
                redirectTo: '/security/signin'
            })
        }

        debug(`Token verified ${req.headers.token}`)

        req.user = token.user
        next()
    })
}