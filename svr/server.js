/*
 * @Author: WouRaoyu
 * @Date: 2021-09-04 13:49:14
 * @LastEditors: WouRaoyu
 * @LastEditTime: 2021-09-04 16:04:54
 * @Description: file content
 * @FilePath: \WebUtils\DTDemo\svr\server.js
 * @Copyright (c) : 2021 VrLab
 */

const express = require("express")
const bodyParser = require('body-parser')
const path = require("path")
const fs = require("fs")

var app = express();

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

let info = {
    roam: [{name: "Test"}],
    geom: [{name: "Test"}]
}

app.use(express.static(path.join(__dirname, '')));

app.post('/upload/roam', (req, res) => {

})

app.post('/upload/geom', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    req.body.items.forEach(element => {
        info.geom.push(element)
    });
})

app.get('/info', (_, res) => {
    console.log(info);
    res.send(info);
})

app.listen(8088, () => {
    console.log("App listening at port 8088\n http://localhost:8088 ")
})