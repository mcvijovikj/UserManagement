const config = require('../config');
const mongoose = require('mongoose');

const { username, password, clusterName, databaseName } = config.getConfigPropertyValue('dbConfig');

mongoose.set('strictQuery', false);

const databaseLink = `mongodb+srv://${username}:${password}@${clusterName}/${databaseName}?retryWrites=true&w=majority`;

const connectToDb = async () => {
    try {
        await mongoose.connect(databaseLink, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
        );
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(err);
    }
}

module.exports = connectToDb;

