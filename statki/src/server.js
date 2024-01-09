'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3001;
app.use(bodyParser.json());

const dbUrl = 'mongodb://localhost:27017/';
const dbName = 'shipsDB';

async function connect() {
    try {
        const client = new MongoClient(dbUrl);
        await client.connect();
        console.log('Pomyślnie połączono z bazą danych!');

        const db = client.db(dbName);
        const shipsCollection = db.collection('ships')
        

        app.get('/ships', async (req, res) => {
            try {
                const ships = await shipsCollection.find().toArray();
                res.json(ships);
            } catch (err) {
                console.error(err);
                return res.json({ error: 'Wystąpił błąd podczas przetwarzania danych.' });
            }
        });

        app.post('/ships', async (req, res) => {
            try {
                const { name, coordinates, atSea } = req.body;

                const existingShip = await shipsCollection.findOne({ "name": name });
                if (existingShip) {
                    return res.json({ error: 'Statek o tej nazwie już istnieje w bazie danych.' });
                }

                const ship = {
                    "name": name,
                    "coordinates": coordinates,
                    "atSea": atSea
                };
            
                if (
                    typeof name !== 'string' ||
                    typeof coordinates !== 'object' ||
                    typeof atSea !== 'boolean'
                ) {
                    return res.json({ error: 'Błędne dane.' });
                }

                const result = await shipsCollection.insertOne(ship);
                if (result.acknowledged === true) {
                    return res.json({ success: 'Dodano statek.' });
                } else {
                    return res.json({ error: 'Błąd. Nie udało się dodać statku.' });
                }

            } catch (err) {
                console.error(err);
                return res.json({ error: 'Wystąpił błąd podczas przetwarzania danych.' });
            }
        });

        app.put('/ships/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const { newCoordinates, newAtSea } = req.body;

                const existingShip = await shipsCollection.findOne({ "_id": new ObjectId(id) });
                if (!(existingShip)) {
                    res.json({ error: 'Brak statku o takim id w bazie danych.' });
                    return;
                }

                const updateData = {};
                if (newCoordinates !== "") updateData.coordinates = newCoordinates; else updateData.coordinates = existingShip.coordinates;
                if (newAtSea !== "") updateData.atSea = newAtSea; else updateData.atSea = existingShip.atSea;

                const result = await shipsCollection.updateOne(
                    { "_id":  new ObjectId(id) },
                    {
                        $set: updateData
                    }
                );

                if (result.modifiedCount === 1) {
                    return res.json({ success: 'Statek został zaktualizowany.' });
                } else {
                    return res.json({ error: 'Nie udało się zaktualizować statku.' });
                }

            } catch (err) {
                console.error(err);
                return res.json({ error: 'Wystąpił błąd podczas przetwarzania danych.' });
            }
        });

        app.delete('/ships/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const ship = await shipsCollection.findOne({ "_id": new ObjectId(id) });
                if (!(ship)) {
                    res.json({ error: 'Brak statku o takim id w bazie danych.' });
                    return;
                }

                const result = await shipsCollection.deleteOne(
                    { "_id": new ObjectId(id) }
                );

                if (result.deletedCount === 1) {
                    return res.json({ success: 'Usunięto statek.' });
                } else {
                    return res.json({ error: 'Nie udało się usunąć statku.' });
                }

            } catch (err) {
                console.error(err);
                return res.json({ error: 'Wystąpił błąd podczas przetwarzania danych.' });
            }
        });

        app.listen(port, () => {
            console.log(`Serwer działa na porcie: ${port}`);
        });

    } catch (err) {
        console.error('Wystąpił błąd podczas łączenia z bazą.', err);
    }
}

connect();