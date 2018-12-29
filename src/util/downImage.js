const fs = require('fs');
// const request = require("request");
const https = require("https");
const mkdirp = require('mkdirp');
const path = require('path');
//本地存储目录
const dir = path.join(__dirname + '/../images');

//创建目录
// mkdirp(dir, function(err) {
//     if(err){
//         console.log(err);
//     }
// });

function download (url, filename) {
    https.get(url, function(err, res, body){
        https(url).pipe(fs.createWriteStream(dir + "/" + filename));
    });
}
module.exports = {
    download
}