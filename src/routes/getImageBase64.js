const fs = require('fs');
const util = require('util');
const path = require('path');

const readFile = util.promisify(fs.readFile);
let filePath = path.join('src', 'static', 'public', 'france.jpeg');
module.exports = async (req, res) => {
    try {
        const file = await readFile(filePath);
        console.log(file.length);
        res.send({ img: file.toString('base64') });
    } catch (e) {
        console.log(e);
        res.send(e);
    }

};
