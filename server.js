const express = require('express');
const app = express();
const port = 5000;
const fs = require('fs')
const url = require('url')

const content = require('./content.txt')
const urlData = {}
let durationInMilliseconds;

const urlGet = (req) =>{
    return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    })
}

const logging = (req, res, next) =>{
    urlData.url = urlGet(req)
    urlData.method = req.method
    urlData.duration = durationInMilliseconds
    fs.writeFileSync('./log.txt', JSON.stringify(urlData, null, 2) )
    next()
}

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

app.use(express.json())
app.use((req,res,next)=>{
    console.log(`${req.method}`)
    const start = process.hrtime()
    res.on('finish', ()=>{
        durationInMilliseconds = getDurationInMilliseconds (start) 
        console.log(`Finished ${durationInMilliseconds}`)
    })
    res.on('close', ()=>{
        durationInMilliseconds = getDurationInMilliseconds (start)
        console.log(`Close ${durationInMilliseconds}`)
    })
    next()
})
app.use(logging)

app.get('/', (req, res) => {
    res.send(content)
})

app.post('/', (req, res) => {
    const bodyTxt = req.body
    fs.writeFileSync('./content.txt', JSON.stringify(bodyTxt, null, 2))
    res.send(content)
})

app.listen(port, () => {
    console.log('Running')
})