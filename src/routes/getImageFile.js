const path = require('path');

const root = path.join('src', 'static', 'public');
const fileName = 'coburg.jpeg';

module.exports = async (req, res) => {
    res.sendFile(fileName, {
        root,
    });
};
