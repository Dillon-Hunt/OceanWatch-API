import { Router } from 'express'
import { query_database } from '../index.js'
import { valid_input, verify_jwt } from '../authentication.js'

const router = Router()

// Fetch recent sighting data from
router.get('/', async (req, res, next) => {

    // Get current year
    const today = new Date()
    const year = isNaN(req.query.year) ? today.getFullYear() : today.getFullYear() - req.query.year

    // Query database
    const response = await query_database(`SELECT sighting_id, username, longitude, latitude, time, day, month, year, description, distance FROM sightings WHERE year >= ? ORDER BY year, month, day ASC;`, [ year ])
    
    // Check for errors and return data
    if (response.error !== null) {
        res.status(400).send(response.error)
    } else {
        res.status(200).send(response.result)
    }
})

router.post('/:id', async (req, res, next) => {
    const response = await query_database('DELETE FROM sightings WHERE sighting_id = ?;', [parseInt(req.params.id)])
    res.status(200).send(response.result)
})

router.post('/', async (req, res, next) => {
    if (!valid_input(req.body.longitude, req.body.latitude, req.body.time, req.body.day, req.body.month, req.body.year, req.body.distance)) res.status(400).send({ message: 'Invalid input.' })
    else {
        const jwt_content = verify_jwt(req.body.token)
        if (jwt_content.username === undefined) res.status(400).send({ message: 'Invalid token.' }) 
        else {
            const sighting = {
                username: jwt_content.username,
                longitude: req.body.longitude,
                latitude: req.body.latitude,
                time: req.body.time,
                day: req.body.day,
                month: req.body.month,
                year: req.body.year,
                description: req.body.description,
                distance: req.body.distance,
            }

            const response = await query_database('INSERT INTO sightings (species_id, username, longitude, latitude, time, day, month, year, description, distance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                null,
                sighting.username,
                sighting.longitude,
                sighting.latitude,
                sighting.time,
                sighting.day,
                sighting.month,
                sighting.year,
                sighting.description,
                sighting.distance
            ])

            if (response.error !== null) {
                res.status(400).send(response.error)
            } else {
                res.status(200).send('Successfully reported sighting.')
            }
        }
    }

})

export const sightings_router = router