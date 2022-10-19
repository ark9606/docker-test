const fs = require('fs');
const util = require('util');
const path = require('path');

const readFile = util.promisify(fs.readFile);
let filePath = path.join(__dirname);
console.log('filePath', filePath);
let dirs = __dirname.split(path.sep);
console.log('dirs', dirs);
dirs = dirs.slice(0, -2);
console.log('dirs', dirs);
filePath = path.join('src', 'static', 'public', 'france.jpeg');
console.log('filePath', filePath);

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
