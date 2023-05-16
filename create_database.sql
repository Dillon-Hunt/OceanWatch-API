/* Create User */
DROP USER 'api'@'localhost';
CREATE USER 'api'@'localhost' IDENTIFIED BY '123456';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, RELOAD, PROCESS, REFERENCES, INDEX, ALTER, SHOW DATABASES, CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, REPLICATION SLAVE, REPLICATION CLIENT, CREATE VIEW, SHOW VIEW, CREATE ROUTINE, ALTER ROUTINE, CREATE USER, EVENT, TRIGGER ON *.* TO 'api'@'localhost' WITH GRANT OPTION;
ALTER USER 'api'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
FLUSH PRIVILEGES;

/* Create Database */
DROP DATABASE oceanwatch; 
CREATE DATABASE oceanwatch;
USE oceanwatch;

/* Create Tables */
/* CREATE TABLE animal_groups (
    animal_group_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(16) NOT NULL,
    icon_url VARCHAR(255) NOT NULL,
    PRIMARY KEY (animal_group_id)
);

CREATE TABLE animals (
    animal_id INT NOT NULL AUTO_INCREMENT,
    animal_group_id INT NOT NULL,
    common_name VARCHAR(32) NOT NULL,
    scientific_name VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    PRIMARY KEY (animal_id),
    FOREIGN KEY (animal_group_id) REFERENCES animal_groups (animal_group_id)
); */

CREATE TABLE species (
    species_id INT NOT NULL AUTO_INCREMENT,
    common_name VARCHAR(32) NOT NULL,
    scientific_name VARCHAR(32) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    PRIMARY KEY (species_id)
);

/* CREATE TABLE sharks (
    shark_id INT NOT NULL AUTO_INCREMENT,
    species_id INT NOT NULL,
    name VARCHAR(16) NOT NULL,
    length FLOAT NOT NULL,
    PRIMARY KEY (shark_id),
    FOREIGN KEY (species_id) REFERENCES species (species_id)
); */

CREATE TABLE users (
    username VARCHAR(16) NOT NULL,
    first_name VARCHAR(16) NOT NULL,
    last_name VARCHAR(16) NOT NULL,
    email VARCHAR(32) NOT NULL,
    hashed_password VARCHAR(60) NOT NULL,
    hashed_temporary_token VARCHAR(60),
    hashed_token VARCHAR(60),
    verification_code VARCHAR(6) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (username)
);

/* CREATE TABLE captures (
    capture_id INT NOT NULL AUTO_INCREMENT,
    shark_id INT NOT NULL,
    time INT,
    day INT, 
    month INT NOT NULL, 
    year INT NOT NULL,
    location VARCHAR(64) NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    water_temp FLOAT,
    PRIMARY KEY (capture_id),
    FOREIGN KEY (shark_id) REFERENCES sharks (shark_id)
); */

CREATE TABLE attacks (
    attack_id INT NOT NULL AUTO_INCREMENT,
    species_id INT,
    UIN INT,
    time INT,
    day INT, 
    month INT NOT NULL, 
    year INT NOT NULL,
    location VARCHAR(64) NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    PRIMARY KEY (attack_id),
    FOREIGN KEY (species_id) REFERENCES species (species_id)
);

/* Does Public Need To Be Able To Add Shark Sightings? */
CREATE TABLE sightings (
    sighting_id INT NOT NULL AUTO_INCREMENT,
    species_id INT,
    username VARCHAR(16) NOT NULL,
    time INT,
    day INT, 
    month INT NOT NULL, 
    year INT NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    description TEXT,
    distance INT NOT NULL,
    PRIMARY KEY (sighting_id),
    FOREIGN KEY (species_id) REFERENCES species (species_id),
    FOREIGN KEY (username) REFERENCES users (username)
);

/* Add Example Data */
/* INSERT INTO animal_groups (name, icon_url) VALUES
    ('Turtles', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pinclipart.com%2Fpicdir%2Fbig%2F118-1187050_seas-ilhouette-sea-sea-turtle-silhouette-png-clipart.png&f=1&nofb=1&ipt=14451439dd22b0060a48ddc25f6b54ca39b388e2509a4d843812934f8c63b27f&ipo=images'),
    ('Whales', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.onlinewebfonts.com%2Fsvg%2Fimg_32688.png&f=1&nofb=1&ipt=c1a09e3062cc784c5046bda5153bb4e5c317d3895fe40cf6fec967f10fe954c8&ipo=images');

INSERT INTO animals (animal_group_id, common_name, scientific_name, description, image_url) VALUES
    (1, 'Green Sea Turtle', 'Chelonia Mydas', 'The green sea turtle, also known as the green turtle, black turtle or Pacific green turtle, is a species of large sea turtle of the family Cheloniidae. It is the only species in the genus Chelonia.', 'https://www.freepnglogos.com/uploads/turtle-png/turtle-png-transparent-image-pngpix-1.png'),
    (2, 'Humpback Whale', 'Megaptera novaeangliae', 'The humpback whale is a species of baleen whale. It is a rorqual and is the only species in the genus Megaptera. Adults range in length from 14–17 m and weigh up to 40 metric tons. The humpback has a distinctive body shape, with long pectoral fins and tubercles on its head.', 'https://www.pngmart.com/files/22/Humpback-Whale-PNG-Isolated-File.png');
*/

INSERT INTO species (common_name, scientific_name, description, image_url) VALUES
    ('Hammerhead Shark', 'Sphyrnidae', 'The hammerhead sharks are a group of sharks that form the family Sphyrnidae, so named for the unusual and distinctive structure of their heads, which are flattened and laterally extended into a "hammer" shape called a cephalofoil.', 'https://www.seekpng.com/png/full/122-1228119_sharks-drawing-hammerhead-shark-great-hammerhead-shark-png.png'),
    ('Black Tip Reef Shark', 'Carcharhinus Melanopterus', 'The blacktip reef shark is a species of requiem shark, in the family Carcharhinidae, which can be easily identified by the prominent black tips on its fins. Among the most abundant sharks inhabiting the tropical coral reefs of the Indian and Pacific Oceans, this species prefers shallow, inshore waters.', 'https://www.nicepng.com/png/full/122-1227773_black-tip-reef-shark-transparent.png');

/* INSERT INTO sharks (species_id, name, length) VALUES
    (1, 'Jerry', 2.5),
    (2, 'Frank', 1.5); */

INSERT INTO users (username, first_name, last_name, email, hashed_password, verification_code, hashed_temporary_token, hashed_token, verified) VALUES
    ('Dillon_Hunt', 'Dillon', 'Hunt', 'dhunt@saac.qld.edu.au', '$2b$10$mROf7e4HQ8RN7VibIigpYeaIASHhTICRe8wa8Q/GjtdAXf1WwOXyi', '89H3J1', '$2b$10$AZU9bAZf167pywERRxWZzOQOP.2a2XI.JHl9i1L6NN06MjYxjsIhm', '$2b$10$AZU9bAZf167pywERRxWZzOQOP.2a2XI.JHl9i1L6NN06MjYxjsIhm', TRUE),
    ('Generic_User', 'Jane', 'Doe', 'example@example.com', '$2b$10$meKso1KsDGNHLKMH5iby1usnty.INE2c5Qrn0gS8DhY2HXz18yDh2', '9H59JY', '$2b$10$.x2ULbSkLtwI.g7.mVamEu8Qv3oeHydcv8hvDMTOZgRx4ICneY/l.', '$2b$10$.x2ULbSkLtwI.g7.mVamEu8Qv3oeHydcv8hvDMTOZgRx4ICneY/l.', FALSE);

/* INSERT INTO captures (shark_id, time, day, month, year, location, longitude, latitude, water_temp) VALUES
    (1, 1230, 3, 1, 2023, 'Noosa Heads', 153.2, -27.3, 28.9),
    (2, 1025, 2, 2, 2023, 'Noosa Heads', 153.5, -27.5, 22.5); */

INSERT INTO attacks (species_id, time, day, month, year, location, longitude, latitude) VALUES
    (2, 1230, 3, 1, 2023, 'Noosa Heads', 153.25, -26),
    (1, 1437, 27, 3, 2023, 'Noosa Heads', 153.5, -25.6);

INSERT INTO sightings (species_id, username, time, day, month, year, longitude, latitude, description, distance) VALUES
    (1, 'Dillon_Hunt', 1230, 3, 1, 2023, 153.25, -27.3, NULL, 250),
    (NULL, 'Generic_User', 1025, 2, 2, 2023, 153.45, -27.6, 'Two turtles spotted near Noosa Heads', 125);