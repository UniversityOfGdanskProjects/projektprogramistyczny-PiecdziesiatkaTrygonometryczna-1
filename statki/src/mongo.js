use('statki');

db.createCollection('ships');

db.ships.insertMany([
    {
        "name": "Titanic",
        "coordinates": { "x": 10, "y": 20 },
        "atSea": true
      },
    {
        "name": "Lusitania",
        "coordinates": { "x": 15, "y": 5 },
        "atSea": true
    }]);