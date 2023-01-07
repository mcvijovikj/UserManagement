const fs = require('fs');

const configPath = `${__dirname}../../../config.json`;
const configDataFromFileSystem = fs.readFileSync(configPath);
const config = JSON.parse(configDataFromFileSystem);

const getConfigPropertyValue = (key) => {

    if(config[key] === undefined) {
        throw(new Error('This propery is not present in config object.'));
    }
    return config[key]
}

module.exports = {
    getConfigPropertyValue
}