const Sequelize = require('sequelize');

const database = new Sequelize(
    "postgres://postgres:postgres@localhost:5432/postgres",
    {
        pool: {
            max: 5,
            min: 0,
            idle: 10000,
            acquire: 10000,
        },
        logging: false
    }
)
module.exports = database
