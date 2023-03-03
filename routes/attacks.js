import { Router } from 'express'
import { query_database } from '../index.js'

const router = Router()

router.get('/', async (req, res, next) => {

    let filters = []

    if (isNaN(req.query.time_frame) === false) filters.push('WHERE date >= ' + String((new Date()).getTime() - req.query.time_frame * 24 * 60 * 60 * 1000))
    else  filters.push('WHERE date >= ' + String((new Date()).getTime() - 7 * 24 * 60 * 60 * 1000))

    const response = await query_database(`SELECT attack_id, common_name, scientific_name, location, longitude, latitude, date, image_url FROM (attacks LEFT JOIN species ON attacks.species_id = species.species_id) ${filters.join(' ')}`)
    if (response.error !== null) res.status(400).send(response.error)
    else res.status(200).send(response.result)
})

export const attacks_router = router

/* export const list_recent_attacks = async (days) => {
    const time_frame = days * 24 * 60 * 60 * 1000
    const start_time = (new Date()).getTime() - time_frame
    return await query_database(`SELECT * FROM attacks WHERE date > ${start_time}`)
} */