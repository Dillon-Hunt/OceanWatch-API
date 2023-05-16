import { hashSync, compare } from 'bcrypt'
import { createTransport } from 'nodemailer'
import { config } from 'dotenv'
import jwt from 'jsonwebtoken'

import { query_database } from './index.js'

config()

// Authentication Functions
const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: 'noreply.oceanwatch@gmail.com',
      pass: process.env.GMAIL_PASSWORD
    }
})

function hash_password(password) {
    return hashSync(password, 10)
}

async function compare_password(password, hashed_password) {
    return await compare(password, hashed_password)
}

function generate_jwt(user) {
    return jwt.sign(user, process.env.SECRET) // { expiresIn: '1h' }
}

function verify_jwt(token) {
    return jwt.verify(token, process.env.SECRET)
}

function create_token(length) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let token = ''

    for (let i = 0; i < length; i++) {
        token += characters[Math.floor(Math.random() * characters.length)]
    } 

    return token
}

function create_verification_code(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let pin = ''

    for (let i = 0; i < length; i++) {
        pin += characters[Math.floor(Math.random() * characters.length)]
    }

    return pin
}

async function authenticate_user(token) {
    const jwt_content = verify_jwt(token)

    if (jwt_content === undefined) return { status: false }
    else {
        const response = await query_database(`SELECT hashed_token, verified FROM users WHERE username = '${jwt_content.username}'`)
        if (response.error !== null || response.result.length !== 1 || await !compare_password(jwt_content.token, response.result[0].hashed_token)) return { status: false }
        else {
            return { status: true, verified: response.result[0].verified }
        }
    }
}

async function send_verification_email(verification_code, email, first_name, last_name, is_signup) {
    transporter.sendMail({
        from: 'noreply.oceanwatch@gmail.com',
        to: email,
        subject: 'OceanWatch: Verification Code',
        html: `<p>Hi ${first_name} ${last_name},</p><p>${is_signup ? 'Thank you for signing up for OceanWatch.' : ''} Your verification code is ${verification_code}. ${is_signup ? 'Please enter this code in the OceanWatch site to verify your account.' : ''}</p><p>Thank you,<br /><b>OceanWatch Team</b></p>`
    }, (error) => {
        if (error) console.error(error)
    })
}

function valid_input(...input) {
    for (let i = 0; i < input.length; i++) {
        if (input[i] === undefined || input[i] === null || input[i] === '') return false
    }

    return true
}

export { hash_password, compare_password, generate_jwt, verify_jwt, create_token, create_verification_code, authenticate_user, send_verification_email, valid_input }