import { Router } from 'express'
import { query_database } from '../index.js'

const router = Router()

// REMOVE IN PRODUCTION: Used for testing purposes only.
router.get('/', async (req, res, next) => {
    const response = await query_database(`SELECT * FROM tokens`)
    if (response.error !== null) res.status(400).send(response.error)
    else res.status(300).send(response.result)
})

export const tokens_router = router