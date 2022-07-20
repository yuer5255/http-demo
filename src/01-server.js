const express = require('express');
const app = express();
var options = {
    etag: false, // 禁用协商缓存
    lastModified: false, // 禁用协商缓存
    setHeaders: (res, path, stat) => {
        res.set('Cache-Control', 'max-age=100'); // 强缓存超时时间为10秒
        res.set('Expires', new Date('2022-7-17 16:17:57').toUTCString()); // 强缓存超时时间为10秒
    },
};

app.use('/public', express.static((__dirname + '/public'), options))


app.get('/', function (req, res) {
    res.send('hello world')
})

app.get('/aa', (req, res) => {
    res.json({
        name: 'ljy'
    })
})
app.listen(3000);
