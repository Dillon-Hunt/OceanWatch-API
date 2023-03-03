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
CREATE TABLE animal_groups (
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
);

CREATE TABLE species (
    species_id INT NOT NULL AUTO_INCREMENT,
    common_name VARCHAR(32) NOT NULL,
    scientific_name VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    PRIMARY KEY (species_id)
);

CREATE TABLE sharks (
    shark_id INT NOT NULL AUTO_INCREMENT,
    species_id INT NOT NULL,
    name VARCHAR(16) NOT NULL,
    length FLOAT NOT NULL,
    PRIMARY KEY (shark_id),
    FOREIGN KEY (species_id) REFERENCES species (species_id)
);

CREATE TABLE users (
    username VARCHAR(16) NOT NULL,
    first_name VARCHAR(16) NOT NULL,
    last_name VARCHAR(16) NOT NULL,
    email VARCHAR(32) NOT NULL,
    password VARCHAR(32) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(32) NOT NULL,
    PRIMARY KEY (username)
);

CREATE TABLE captures (
    capture_id INT NOT NULL AUTO_INCREMENT,
    shark_id INT NOT NULL,
    date BIGINT NOT NULL,
    location VARCHAR(32) NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    water_temp FLOAT,
    PRIMARY KEY (capture_id),
    FOREIGN KEY (shark_id) REFERENCES sharks (shark_id)
);

CREATE TABLE attacks (
    attack_id INT NOT NULL AUTO_INCREMENT,
    species_id INT,
    date BIGINT NOT NULL,
    location VARCHAR(332) NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    PRIMARY KEY (attack_id),
    FOREIGN KEY (species_id) REFERENCES species (species_id)
);

/* Does Public Need To Be Able To Add Shark Sightings? */
CREATE TABLE sightings (
    sighting_id INT NOT NULL AUTO_INCREMENT,
    animal_id INT NOT NULL,
    username VARCHAR(16) NOT NULL,
    date BIGINT NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    description TEXT,
    distance INT NOT NULL,
    PRIMARY KEY (sighting_id),
    FOREIGN KEY (animal_id) REFERENCES animals (animal_id),
    FOREIGN KEY (username) REFERENCES users (username)
);

CREATE TABLE tokens (
    username VARCHAR(16) NOT NULL,
    token VARCHAR(32) NOT NULL ,
    PRIMARY KEY (username)
);

/* Add Example Data */
INSERT INTO animal_groups (name, icon_url) VALUES
    ('Turtles', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pinclipart.com%2Fpicdir%2Fbig%2F118-1187050_seas-ilhouette-sea-sea-turtle-silhouette-png-clipart.png&f=1&nofb=1&ipt=14451439dd22b0060a48ddc25f6b54ca39b388e2509a4d843812934f8c63b27f&ipo=images'),
    ('Whales', 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.onlinewebfonts.com%2Fsvg%2Fimg_32688.png&f=1&nofb=1&ipt=c1a09e3062cc784c5046bda5153bb4e5c317d3895fe40cf6fec967f10fe954c8&ipo=images');

INSERT INTO animals (animal_group_id, common_name, scientific_name, description, image_url) VALUES
    (1, 'Green Sea Turtle', 'Chelonia Mydas', 'The green sea turtle, also known as the green turtle, black turtle or Pacific green turtle, is a species of large sea turtle of the family Cheloniidae. It is the only species in the genus Chelonia.', 'https://www.freepnglogos.com/uploads/turtle-png/turtle-png-transparent-image-pngpix-1.png'),
    (2, 'Humpback Whale', 'Megaptera novaeangliae', 'The humpback whale is a species of baleen whale. It is a rorqual and is the only species in the genus Megaptera. Adults range in length from 14–17 m and weigh up to 40 metric tons. The humpback has a distinctive body shape, with long pectoral fins and tubercles on its head.', 'https://www.pngmart.com/files/22/Humpback-Whale-PNG-Isolated-File.png');

INSERT INTO species (common_name, scientific_name, description, image_url) VALUES
    ('Hamerhead Shark', 'Sphyrnidae', 'The hammerhead sharks are a group of sharks that form the family Sphyrnidae, so named for the unusual and distinctive structure of their heads, which are flattened and laterally extended into a "hammer" shape called a cephalofoil.', 'https://www.seekpng.com/png/full/122-1228119_sharks-drawing-hammerhead-shark-great-hammerhead-shark-png.png'),
    ('Black Tip Reef Shark', 'Carcharhinus Melanopterus', 'The blacktip reef shark is a species of requiem shark, in the family Carcharhinidae, which can be easily identified by the prominent black tips on its fins. Among the most abundant sharks inhabiting the tropical coral reefs of the Indian and Pacific Oceans, this species prefers shallow, inshore waters.', 'https://www.nicepng.com/png/full/122-1227773_black-tip-reef-shark-transparent.png');

INSERT INTO sharks (species_id, name, length) VALUES
    (1, 'Jerry', 2.5),
    (2, 'Frank', 1.5);

INSERT INTO users (username, first_name, last_name, email, password, verification_code) VALUES
    ('Dillon_Hunt', 'Dillon', 'Hunt', 'dhunt@saac.qld.edu.au', '123abc#', '89H3J1'),
    ('Generic_User', 'Jane', 'Doe', 'example@example.com', 'n0t_a_rob0t', '123456');

INSERT INTO captures (shark_id, date, location, longitude, latitude, water_temp) VALUES
    (1, 1677639421046, 'Noosa Heads', 153.2, -27.3, 28.9),
    (2, 1676988000000, 'Noosa Heads', 153.5, -27.5, 22.5);

INSERT INTO attacks (species_id, date, location, longitude, latitude) VALUES
    (2, 1676988000000, 'Noosa Heads', 153.25, -26),
    (1, 1677247200000, 'Noosa Heads', 153.3, -27.3),
    (2, 1677537893469, 'Noosa Heads', 153.7, -26.3),
    (2, 1677333600000, 'Noosa Heads', 153.95, -28),
    (1, 1677537893169, 'Noosa Heads', 153.5, -25.6);

INSERT INTO sightings (animal_id, username, date, longitude, latitude, description, distance) VALUES
    (1, 'Dillon_Hunt', 1676988003000, 153.25, -27.3, NULL, 250),
    (2, 'Generic_User', 1676987003000, 153.45, -27.6, 'Two turtles spotted near Noosa Heads', 125);

INSERT INTO tokens (username, token) VALUES
    ('Dillon_Hunt', 'AnlD8aqftLrrrK0SLFuvNt4EkTzMicFl')