import { request, Router } from 'express'

import { query_database } from '../index.js'
import { hash_password, compare_password, generate_jwt, verify_jwt, create_token, create_verification_code, authenticate_user, send_verification_email, valid_input } from '../authentication.js'

const router = new Router()

// TODO: On sign in regenerate verification code and send it to the user's email

// Login & Send verification code to user's email
router.post('/login/', async (req, res, next) => {

    if (!valid_input(req.body.username, req.body.password)) res.status(400).send({ message: 'Invalid input.' })

    // Create user object
    let user = {
        username: req.body.username.toLowerCase(),
        password: req.body.password
    }

    // Check if user with that username and password exists
    const response_1 = await query_database(`SELECT first_name, last_name, email, hashed_password, verification_code FROM users WHERE username = '${user.username}';`)

    // Check for errors
    if (response_1.error !== null) { 
        res.status(400).send(response_1.error)
    } else if (response_1.result.length === 0 || await !compare_password(user.password, response_1.result[0].hashed_password)) {
        res.status(400).send({ message: 'Username or password is incorrect.' })
    } else {

        // Add response to user data
        user = {
            ...user,
            ...response_1.result[0]
        }

        // Send verification code to email
        send_verification_email(user.verification_code, user.email, user.first_name, user.last_name, false)
        
        // Create temporary token and jwt token
        const temporary_token = create_token(32)
        const jwt_token = generate_jwt(JSON.stringify({ username: user.username, temporary_token: temporary_token }))

        const response = await query_database(`UPDATE users SET hashed_token = '${hash_password(temporary_token)}' WHERE username = '${user.username}';`)
    
        // Check for errors and return response
        if (response.error !== null) {
            res.status(400).send(response.error)
        } else {
            res.status(200).send({ message: 'Login successful.', token: jwt_token })
        }
    }
})

// Get authentication token
router.post('/verification/', async (req, res, next) => {
    // Validate input
    if (!valid_input(req.body.token, req.body.verification_code)) res.status(400).send({ message: 'Invalid input.' })

    // Verify JWT
    const jwt_content = verify_jwt(req.body.token)
    
    // Validate token
    if (jwt_content === undefined) {
        return res.status(401).send({ message: 'Invalid token.' })
    } else {
        // Create user object
        let user = {
            ...jwt_content,
            verification_code: req.body.verification_code.toUpperCase()
        }
    
        // Check if verified
        const response_1 = await query_database(`SELECT verified FROM users WHERE username = '${jwt_content.username}' AND verification_code = '${user.verification_code}';`)
    
        // Check for errors
        if (response_1.error !== null) {
            res.status(400).send(response_1.error)
        } else if (response_1.result.length !== 1) {
            res.status(401).send({ message: 'The verification code you entered is incorrect.' })
        } else {
            // Update user object
            user = {
                ...user,
                verified: response_1.result[0]?.verified
            }
    
            // Create verification code and authentication token
            const verification_code = create_verification_code(6)
            const token = create_token(32)
            const jwt_token = generate_jwt(JSON.stringify({ username: user.username, token: token }))
            const response = await query_database(`UPDATE users SET hashed_token = '${hash_password(token)}', verification_code = '${verification_code}' WHERE username = '${user.username}';`)
    
            // Return response
            if (response.error !== null) {
                res.status(400).send(response.error)
            } else {
                res.status(200).send({ token: jwt_token, verified: user.verified })
            }
        }
    }
})

// Check token is valid
router.post('/validate/', async (req, res, next) => {
    if (!valid_input(req.body.token)) res.status(400).send({ message: 'Invalid input.' })
    else {
        const authenticated = await authenticate_user(req.body.token)
        
        if (authenticated.status) { 
            res.status(200).send({ message: 'Token is valid.', verified: authenticated.verified })
        } else {
            res.status(401).send({ message: 'Token is invalid.' })
        }
}
})

export const auth_router = router