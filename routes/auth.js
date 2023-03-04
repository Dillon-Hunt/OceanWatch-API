import { request, Router } from 'express'

import { query_database } from '../index.js'
import { create_token, create_verification_code, authenticate_user, send_verification_email, valid_input } from '../authentication.js'

const router = new Router()

// TODO: On sign in regenerate verification code and send it to the user's email

// Login & Send verification code to user's email
router.post('/login/', async (req, res, next) => {

    if (!valid_input(req.body.username, req.body.password)) res.status(400).send({ message: 'Invalid input.' })

    let user = {
        username: req.body.username.toLowerCase(),
        password: req.body.password
    }

    // Check if user with that username and password exists
    const response = await query_database(`SELECT first_name, last_name, email, temporary_token FROM users WHERE username = '${user.username}' AND password = '${user.password}'`)

    user = {
        ...user,
        first_name: response.result[0]?.first_name,
        last_name: response.result[0]?.last_name,
        email: response.result[0]?.email,
        temporary_token: response.result[0]?.temporary_token
    }

    if (response.error !== null) res.status(400).send(response.error)
    else if (response.result.length === 0) res.status(400).send({ message: 'Username or password is incorrect.' })
    else {
        // Create verification code and authentication token
        const verification_code = create_verification_code(6)

        // Send verification code to email
        send_verification_email(verification_code, user.email, user.first_name, user.last_name, false)

        // Update user's verification code
        const response = await query_database(`UPDATE users SET verification_code = '${verification_code}' WHERE username = '${user.username}' AND password = '${user.password}'`)
        if (response.error !== null) res.status(400).send(response.error)
        else res.status(200).send({ message: 'Login successful.', temporary_token: user.temporary_token })
    }
})

// Get authentication token
router.post('/verification/', async (req, res, next) => {

    if (!valid_input(req.body.username, req.body.temporary_token, req.body.verification_code)) res.status(400).send({ message: 'Invalid input.' })

    let user = {
        username: req.body.username.toLowerCase(),
        temporary_token: req.body.temporary_token,
        verification_code: req.body.verification_code.toUpperCase()
    }

    const response = await query_database(`SELECT verified FROM users WHERE username = '${user.username}' AND temporary_token = '${user.temporary_token}' AND verification_code = '${user.verification_code}'`)
    
    user = {
        ...user,
        verified: response.result[0]?.verified
    }

    if (response.error !== null) {
        res.status(400).send(response.error)
    } else if (response.result.length !== 1) {
        res.status(401).send({ message: 'The verification code you entered is incorrect.' })
    } else {
        const token = create_token(32)
        const new_temporary_token = create_token(32)

        const response = await query_database(`INSERT INTO tokens (username, token) VALUES ('${user.username}', '${token}') ON DUPLICATE KEY UPDATE token = VALUES(token)`)
        if (response.error !== null) res.status(400).send(response.error)
        else {
            const response = await query_database(`UPDATE users SET temporary_token = '${new_temporary_token}' WHERE username = '${user.username}' AND temporary_token = '${user.temporary_token}'`)
            res.status(200).send({ token: token, verified: user.verified })
        }
    }
})

// Check token is valid
router.post('/validate/', async (req, res, next) => {
    if (!valid_input(req.body.username, req.body.token)) res.status(400).send({ message: 'Invalid input.' })

    const authenticated = await authenticate_user(req.body.username, req.body.token)
    
    if (authenticated.status) res.status(200).send({ message: 'Token is valid.', verified: authenticated.verified })
    else res.status(401).send({ message: 'Token is invalid.' })
})

export const auth_router = router