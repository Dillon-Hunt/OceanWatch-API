import { Router } from 'express'

import { query_database } from '../index.js'
import { hash_password, generate_jwt, create_verification_code, create_token, authenticate_user, send_verification_email, valid_input } from '../authentication.js'

const router = Router()

// Never provide password

// Get user information
router.get('/:username/', async (req, res, next) => {
    if (!valid_input(req.params.username, req.body.username, req.body.token)) res.status(400).send({ message: 'Invalid input.' })

    // User is authenticated using the username of the user they are accessing so they can only access their data.
    const authenticated = await authenticate_user(req.body.username, req.body.token)

    if (authenticated.status && (req.params.username === req.body.username || authenticated.verified)) {
        const response = await query_database(`SELECT username, first_name, last_name, verified FROM users WHERE username = '${req.params.username}'`)
        if (response.error !== null) {
            res.status(400).send(response.error)
        } else res.status(200).send(response.result[0])
    } else if (authenticated.status) {
        res.status(403).send({ message: 'User not authorised.' })
    } else {
        res.status(401).send({ message: 'User not authenticated.' })
    }
})

// Create new user
router.post('/', async (req, res, next) => {
    // Validate input
    if (!valid_input(req.body.username, req.body.first_name, req.body.last_name, req.body.email, req.body.password)) res.status(400).send({ message: 'Invalid input.' })

    // Create user object
    const user = {
        username: req.body.username.toLowerCase(),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email.toLowerCase(),
        password: hash_password(req.body.password)
    }

    // Check if user with that username or email already exists
    const response = await query_database(`SELECT username, email FROM users WHERE username = '${user.username}' OR email = '${user.email}'`)

    // Check for errors
    if (response.error !== null) {
        res.status(400).send(response.error)
    } else if (response.result.length !== 0) {
        res.status(400).send({ message: `A user with that ${response.result.find(existing_user => existing_user.username === user.username) ? 'username' : ''}${response.result.find(existing_user => existing_user.username === user.username) && response.result.find(existing_user => existing_user.email === user.email) ? ' and ' : ''}${response.result.find(existing_user => existing_user.email === user.email) ? 'email' : ''} already exists.` })
    } else {
        // Create verification code and authentication token
        const verification_code = create_verification_code(6)
        const token = create_token(32)
        const jwt_token = generate_jwt(JSON.stringify({ username: user.username, token: token }))

        // Send verification code to email
        send_verification_email(verification_code, user.email, user.first_name, user.last_name, true)

        // Create new user
        const response = await query_database(`INSERT INTO users (username, first_name, last_name, email, hashed_password, verification_code, hashed_token) VALUES ('${user.username}', '${user.first_name}', '${user.last_name}', '${user.email}', '${user.password}', '${verification_code}', '${hash_password(token)}')`)
        
        // Return response
        if (response.error !== null) {
            res.status(400).send(response.error)
        } else {
            res.status(201).send({ message: 'User created successfully.', token: jwt_token })
        }
    }
})


// REMOVE IN PRODUCTION: Used for testing purposes only.
router.get('/', async (req, res, next) => {
    const response = await query_database(`SELECT * FROM users`)

    if (response.error !== null) {
        res.status(400).send(response.error)
    } else {
        res.status(200).send(response.result)
    }
})

export const users_router = router