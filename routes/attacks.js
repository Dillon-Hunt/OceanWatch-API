import { Router } from 'express'

import { query_database } from '../index.js'

const router = Router()

router.get('/', async (req, res, next) => {

    const today = new Date()
    const year = isNaN(req.query.year) ? today.getFullYear() : today.getFullYear() - req.query.year

    const response = await query_database(`SELECT attack_id, common_name, scientific_name, location, longitude, latitude, time, day, month, year, image_url FROM (attacks LEFT JOIN species ON attacks.species_id = species.species_id) WHERE year >= ? ORDER BY year, month, day ASC;`, [ year ])
    if (response.error !== null) {
        res.status(400).send(response.error)
    } else {
        res.status(200).send(response.result)
    }
})

export const attacks_router = router