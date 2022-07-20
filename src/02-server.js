const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')
const etag = require('etag'); 

http.createServer((req, res) => {
    console.log(req.method, req.url)
    const { pathname } = url.parse(req.url)
    console.info('pathname', pathname);
    if (pathname === '/') {
        const data = fs.readFileSync('./index.html')
        res.end(data)
    } else if (pathname === '/public/image/01.jpg') {
        const data = fs.readFileSync(path.join(__dirname, './public/image/01.jpg'))
        res.writeHead(200, {
            Expires: new Date('2022-7-16 12:17:57').toUTCString()
        })
        res.end(data)
    } else if (pathname === '/public/image/02.jpg') {
        const data = fs.readFileSync(path.join(__dirname, './public/image/02.jpg'))
        res.writeHead(200, {
            Expires: new Date('2021-4-30 12:17:57').toUTCString()
        })
        res.end(data)
    } else if (pathname === '/public/image/03.jpg') {
        const { mtime } = fs.statSync(path.join(__dirname, './public/image/03.jpg'))
        console.info('修改时间', mtime);
        const ifModifiedsince = req.headers['if-modified-since']
        if (ifModifiedsince === mtime.toUTCString()) {
            // 缓存生效
            res.statusCode = 304
            res.end()
            return
        }
        const data = fs.readFileSync(path.join(__dirname, './public/image/03.jpg'))
        res.setHeader('last-modified', mtime.toUTCString())
        res.setHeader('Cache-Control', 'no-cache')
        res.end(data)
    } else if (pathname === '/public/image/04.jpg') { 
        const data = fs.readFileSync(path.join(__dirname, './public/image/04.jpg'))
        const etagContent = etag(data)

        const ifNoneMathch = req.headers['if-none-match']
        if (ifNoneMathch === etagContent) {
            // 缓存生效
            res.statusCode = 304
            res.end()
            return
        }

        res.setHeader('etag', etagContent)
        res.setHeader('Cache-Control', 'no-cache')
        res.end(data)
    } else {
        res.statusCode = 404
        res.end()
    }
}).listen(3003, () => {
    console.log('http: //localhost:3003')
})