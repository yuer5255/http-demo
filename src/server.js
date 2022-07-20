var Koa = require('koa');
var app = new Koa();
var Router = require('koa-router')();
const fs = require('fs')
const etag = require('etag');
const path = require('path');


Router.get("/", async (ctx) => {
    ctx.body = "ok"
})

// 强缓存-Expires
Router.get('/test1', async (ctx) => {
    const getResource = () => {
        return new Promise((resolve) => {
            fs.readFile(path.join(__dirname, "./fs/a.txt"), (err, data) => {
                if (err) {
                    return;
                }
                return resolve(data.toString())
            })
        })
    }
    ctx.set('Expires', new Date('2022-7-20 14:30:00').toUTCString())  //设置强缓存 GMT
    ctx.body = await getResource();
})

Router.get('/test2', async (ctx) => {
    const getResource = () => {
        return new Promise((resolve) => {
            fs.readFile(path.join(__dirname, "./fs/a.txt"), (err, data) => {
                console.info('err', err);
                if (err) {
                    return;
                }
                return resolve(data.toString())
            })
        })
    }
    ctx.set('Cache-Control', 'max-age=15')  //设置强缓存，过期时间为10秒
    ctx.body = await getResource();
})


Router.get('/test3', async (ctx) => {
    const ifModifiedSince = ctx.request.header['if-modified-since'];
    const getResource = () => {
        return new Promise((resolve) => {
            fs.stat(path.join(__dirname, "./fs/a.txt"), (err, stats) => {
                if (err) {
                    console.log(err);
                }
                return resolve(stats)
            })
        })
    }
    let resource = await getResource();
    let fileContent = await getFile();
    // touch -mt 202207221615 src/fs/a.txt
    console.info(fileContent);
    // atime	Access Time	访问时间	
    // 最后一次访问文件（读取或执行）的时间
    // ctime	Change Time	变化时间	
    // 最后一次改变文件（属性或权限）或者目录（属性或权限）的时间
    // mtime	Modify Time	修改时间	
    // 最后一次修改文件（内容）或者目录（内容）的时间
    if (ifModifiedSince === resource.mtime.toUTCString()) { //把具体的日期转换为（根据 GMT）字符串
        ctx.status = 304;
    }
    ctx.set('Last-Modified', resource.mtime.toUTCString());
    ctx.body = fileContent
})


Router.get('/test4', async (ctx) => {
    const ifNoneMatch = ctx.request.header['if-none-match'];
    const getResource = () => {
        return new Promise((resolve) => {
            fs.readFile(path.join(__dirname, "./fs/a.txt"), (err, data) => {
                if (err) {
                    console.log(err);
                }
                return resolve(etag(data))
            })
        })
    }
    let etagContent = await getResource();
    // let fileContent = await getFile();
    console.info('etagContent', etagContent);
    console.info('ifNoneMatch', ifNoneMatch, ifNoneMatch === etagContent);
    // atime	Access Time	访问时间	
    // 最后一次访问文件（读取或执行）的时间
    // ctime	Change Time	变化时间	
    // 最后一次改变文件（属性或权限）或者目录（属性或权限）的时间
    // mtime	Modify Time	修改时间	
    // 最后一次修改文件（内容）或者目录（内容）的时间
    if (ifNoneMatch === etagContent) { //把具体的日期转换为（根据 GMT）字符串
        ctx.status = 304;
    }
    ctx.set('Etag', etagContent);
    ctx.body = etagContent
})

const getFile = () => {
    return new Promise((resolve) => {
        fs.readFile(path.join(__dirname, "./fs/a.txt"), (err, data) => {
            if (err) {
                return;
            }
            console.info(data.toString());
            return resolve(data.toString())
        })
    })
}

const getImage = (path1) => {
    return new Promise((resolve) => {
        fs.readFile(path.join(__dirname, path1), (err, data) => {
            if (err) {
                return;
            }
            return resolve(data)
        })
    })
}

app.use(Router.routes()).use(Router.allowedMethods());

app.listen(3000, () => {
    console.info('服务启动，监听端口号3000');
});
