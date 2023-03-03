import { Router } from 'express'
import { query_database } from '../index.js'

const router = Router()

router.get('/', async (req, res, next) => {
    const response = await query_database(`SELECT * FROM sightings`)
    if (response.error !== null) res.status(400).send(response.error)
    else res.status(200).send(response.result)
})

export const sightings_router = router