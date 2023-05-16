import multer from 'multer'
import reader from 'xlsx'
import { Router } from 'express'

import { query_database } from '../index.js'

const router = Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
})

const upload = multer({ 
    storage: storage,
    limits: {
        files: 1,
        fileSize: 1024 * 1024 * 10
    },
})

router.post('/', upload.single('file'), async (req, res, next) => {

    // Read file
    const file = reader.readFile(req.file.path)
    const sheets = file.SheetNames
  
    // Loop through each Sheet, combine data into one array
    let data = []
    for (let i = 0; i < sheets.length; i++) {
        const temp = reader.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]])
            temp.forEach((res) => {
                data.push(res)
            }
        )
    }

    for (let i = 0; i < data.length; i++) {

        // Skip row if no scientific name (incomplete data)
        if (data[i]['Shark.scientific.name'] === undefined) continue

        // Get row
        const row = data[i]
        
        // Check if species exists in database
        let species_response = await query_database(`SELECT species_id FROM species WHERE scientific_name = '${row['Shark.scientific.name'].trim()}';`)

        if (species_response.result.length === 0) {

            // Create species object
            const new_species = {
                common_name: `"${row['Shark.common.name'].trim().split(" ").map(word => {   return word.charAt(0).toUpperCase() + word.slice(1); }).join(" ")}"`,
                scientific_name: `"${row['Shark.scientific.name'].trim().split(" ").map(word => {   return word.charAt(0).toUpperCase() + word.slice(1); }).join(" ")}"`,
                description: null,
                image_url: null
            }

            // Insert new species into database and get species_id
            await query_database(`INSERT INTO species (common_name, scientific_name, description, image_url) VALUES (${Object.values(new_species).map(value => value === null ? "null" : value).join(', ')});`)
            species_response = await query_database(`SELECT species_id FROM species WHERE scientific_name = '${row['Shark.scientific.name'].trim()}';`)
        }

        // Check for error or null result (length !== 1)

        let date = null;

        const date_string = row['Reference']

        if (date_string !== undefined) {
            const match = date_string.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
            if (match !== null) {
                const day = parseInt(match[1])
                const month = parseInt(match[2])
                const year = parseInt(match[3])
                date = { day, month, year } // { day: 3, month: 4, year: 2001 }
            }
        }

        // Create attack object
        const new_attack = {
            species_id: parseInt(species_response.result[0].species_id),
            UIN: parseInt(row['UIN']),
            time: parseInt(row['Time.of.incident']) || null,
            day: date?.day || null,
            month: parseInt(row['Incident.month']),
            year: parseInt(row['Incident.year']),
            location: `"${row['Location'] === null ? null : row['Location'].trim().split(" ").map(word => {   return word.charAt(0).toUpperCase() + word.slice(1); }).join(" ")}"`,
            latitude: parseFloat(row['Latitude']),
            longitude: parseFloat(row['Longitude']),
        }

        console.log(new_attack)

        // Insert attack into database given that it doesn't already exist (matching UIN)
        const resp = await query_database(`INSERT INTO attacks (species_id, UIN, time, day, month, year, location, latitude, longitude) SELECT ${Object.values(new_attack).map(value => value === null ? "null" : value).join(', ')} WHERE NOT EXISTS (SELECT * FROM attacks WHERE UIN = ${new_attack.UIN});`)
        console.log(resp)
    }

    res.status(200).send('Successfully uploaded file.')
})

export const upload_router = router