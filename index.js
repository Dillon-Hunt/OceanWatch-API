// Dependencies
import mysql from 'mysql'
import express from 'express'
import cors from 'cors'

// Routers
import { animal_groups_router } from './routes/animal_groups.js'
import { animals_router } from './routes/animals.js'
import { attacks_router } from './routes/attacks.js'
import { auth_router } from './routes/auth.js'
import { captures_router } from './routes/captures.js'
import { sharks_router } from './routes/sharks.js'
import { sightings_router } from './routes/sightings.js'
import { species_router } from './routes/species.js'
import { upload_router } from './routes/upload.js'
import { users_router } from './routes/users.js'

const CONNECTION_PARAMS = {
    host: '127.0.0.1',
    user: 'api',
    password: '123456',
    database: 'oceanwatch',
    port: 3306
}

const app = express()
const PORT = 3005

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

export const query_database = async (query, params) => {
    const connection = mysql.createConnection(CONNECTION_PARAMS)
    const error = await connection.connect()
    
    if (error) return { error: error, result: null }
    return await new Promise(callback => 
        connection.query(query, params, (error, result) => {
            connection.end()
            callback({ error: error, result: result })
        })
    )
}

export const test_query = async (query) => {
    const response = await query_database(query)
    if (response.error !== null) console.error(response.error)
    else console.table(response.result)
}

// Routers
app.use('/animal_groups', animal_groups_router)
app.use('/animals', animals_router)
app.use('/attacks', attacks_router)
app.use('/auth', auth_router)
app.use('/captures', captures_router)
app.use('/sharks', sharks_router)
app.use('/sightings', sightings_router)
app.use('/species', species_router)
app.use('/upload', upload_router)
app.use('/users', users_router)

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  console.error(err.message, err.stack)
  res.status(statusCode).json({ message: err.message })
  return
})

app.listen(PORT, () => {
    console.log(`OceanWatch API listening at http://localhost:${PORT}`)
})

// Testing
// test_query(`SELECT attack_id, common_name, scientific_name, location, longitude, latitude, date FROM (attacks LEFT JOIN species ON attacks.species_id = species.species_id)`)