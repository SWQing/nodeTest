const express = require('express');
let home = express.Router();
let User = require('../models/user');
let auth = require('../util/auth');
var http = require('http');
var cheerio = require('cheerio');
home.index = (req, res, next) => {
    // console.log(1)
    var html = null;
    var url = 'http://www.lzs100.cc/dongwu/';
    var isLoding = 1;
    let requestFun = (page, callback) => {
        http.get(url + page, function (res) {
            var chunks = [];
            var size = 0;
            res.on('data',function(chunk){   //监听事件 传输
                chunks.push(chunk);
                size += chunk.length;
            });
            // console.log(chunks)
            res.on('end',function(){  //数据传输完
                var data = Buffer.concat(chunks,size);
                var html = data.toString();
                   // console.log(chunks);
                $ = cheerio.load(html); //cheerio模块开始处理 DOM处理
                // console.log(($.html()))
                var arrs = [];
                $("#left .post").each(function(item) {
                    // console.log($(this))
                    // arrs.img$('.content .posts-gallery-img').find('a').attr('href')
                    var job = {};
                    job.img = $(this).find('.tu img').attr('src')
                    job.title = $(this).find('.tu img').attr('alt')
                    // job.id = $(this).find('.posts-gallery-img a').attr('href')
                    // job.time = JSON.stringify($(this).find('.content-box .posts-gallery-content .posts-gallery-info .ico-time').html())
                    // job.time = job.time.slice(job.time.length - 11, job.time.length - 1)
                    // if(job.id) {
                    //     job.id = job.id.split('/')
                    //     job.id = job.id[job.id.length - 1]
                    //     job.id = job.id.slice(0, job.id.length - 5)
                    // }
                    // http.get('http://heibaimanhua.com/duanzishou/' + job.id + '.html', function (res2) {
                    //     var chunks2 = [];
                    //     var size2 = 0;
                    //     res2.on('data',function(chunk2){   //监听事件 传输
                    //         chunks2.push(chunk2);
                    //         size2 += chunk2.length;
                    //     });
                    //     res2.on('end',function() {  //数据传输完
                    //         var data2 = Buffer.concat(chunks2, size2);
                    //         var html2 = data2.toString();
                    //         //    console.log(html);
                    //         $2 = cheerio.load(html2); //cheerio模块开始处理 DOM处理
                    //         console.log($2.html())
                    //     })
                    // })
                    if(job.title) {
                        arrs.push(job)
                    }
                    // http.get()
                })
                // console.log(arrs)
                isLoding ++;
                callback(arrs)
                // console.log($.html())
            });
        })
    }
    let allArrs = []
    for (var i = 1; i <= 2; i ++) {
        requestFun(i, data => {
            // console.log(data)
            allArrs = allArrs.concat(data)
        })
    }
    let timer = setInterval(() => {
        if(isLoding >= 1) {
            // console.log(11111)
            return res.json(allArrs);
        } else {
            clearInterval(timer)
        }
    }, 1000)

}
home.regPage = (req, res) => {
    res.render('register', {
        title: '注册'
    })
}
home.reg = (req, res, next) => {
    let userData = req.body;
    User.findOne({name: userData.name}).then(function (user) {
        if(user) {
            return res.send('您已注册')
            // return res.redirect('/login');
        } else {
            let newUser = new User(userData);
            newUser.save().then(user => {
                return res.send('注册成功');
            }).catch(err => {
                return res.end(err);
            })
        }
    })
}
home.loginPage = (req, res) => {
    res.render('login', {
        title: '登陆'
    })
}
home.login = (req, res, next) => {


    let data = req.body;
    // res.redirect('/reg');
    if(data.username == '') {
        return res.send({resultCode: 400, resultMsg: '用户名为空'});
    } else if(data.password == '') {
        return res.send({resultCode: 400, resultMsg: '密码为空'});
    } else {
        User.findOne({name: data.name}).then(user => {
            if(!user) {
                return res.send({resultCode: 400, resultMsg: '用户不存在'});
            }
            if(data.password != user.password) {
                return res.send({resultCode: 400, resultMsg: '密码错误'});
            }
            //生成cookie
            auth.gen_session(user, res);
            return res.send({resultCode: 200, resultMsg: '登录成功'});
        })
    }
}
//退出
home.logout = (req, res, next) => {
    req.session.destroy();
    res.clearCookie('suweiqing');
    return res.redirect('/');
}
module.exports = home;