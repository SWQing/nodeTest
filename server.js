// 一些依赖库
var http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    eventproxy = require('eventproxy');
const fs = require('fs');

var ep = new eventproxy(),
    urlsArray = [], //存放爬取网址
    pageUrls = [],  //存放收集文章页面网站
    pageNum = 2,  //要爬取文章的页数
    articleInfo = [],
    detailArr = [],
    articleNum = 0

for(var i=1 ; i<= pageNum ; i++){
    pageUrls.push('http://heibaimanhua.com/page/'+ i);
}
let myCount = 0;

//获取文章详情
function getDetail(url) {
    superagent.get(url).end(function (err, html) {
        if(err) {
            console.log(err)
            return;
        }
        console.log(url)
        var $ = cheerio.load(html.text)
        let imgArr = []
        $('.post-content .post-images-item img').each(function (index) {
            if(index == 0) {
                imgArr.push($(this).attr('src'))
            } else if(index < $('.post-content .post-images-item img').length - 1) {
                imgArr.push($(this).attr('data-original'))
            }

        })
        // for(let i = 0; i< img.length; i ++) {
        //     imgArr.push(img[i])
        // }
        // console.log(img)
        let content = {
            title: $('.post-title .title').text(),
            date: $('.post-title .postclock').text(),
            imgArr: imgArr
        }
        detailArr.push(content)
    })
}

// 主start程序
function start(){
    function onRequest(req, res){
        // 轮询 所有文章列表页
        pageUrls.forEach(function(pageUrl){
            superagent.get(pageUrl)
                .end(function(err,pres){
                    // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
                    // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
                    // 剩下就都是利用$ 使用 jquery 的语法了
                    var $ = cheerio.load(pres.text);
                    var curPageUrls = $('.posts-default-title a');
                    var curImgArr = $('.thumbnail')
                    // console.log(curImgArr)
                    // console.log(curPageUrls
                    for(var i = 0 ; i < curPageUrls.length ; i++){
                        var articleUrl = curPageUrls.eq(i).attr('href');
                        urlsArray.push(articleUrl);
                        // console.log(curImgArr)
                        let imgArr = []
                        for(var j = 0; j < curImgArr.length; j ++) {
                            if(curImgArr.eq(j).attr('alt') == curPageUrls.eq(i).attr('title')) {
                                imgArr.push(curImgArr.eq(j).attr('src'))
                            }
                            // console.log({img: curImgArr.eq(j).attr('src'), title: curImgArr.eq(j).attr('alt')})
                        }
                        articleInfo.push({title: curPageUrls.eq(i).attr('title'), src: curPageUrls.eq(i).attr('href'), imgArr: imgArr, id: pageUrl.slice(-1, pageUrl.length) + '-' +i})
                        // 相当于一个计数器
                        ep.emit('BlogArticleHtml', articleUrl);
                    }
                });
        });

        ep.after('BlogArticleHtml',pageUrls.length*50,function(articleUrls){
            // console.log(articleInfo.length)
            // console.log(articleUrls)

            // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
            // 控制并发数
            var curCount = 0;
            var reptileMove = function(url,callback){
                myCount++
                console.log(myCount)
                //延迟毫秒数
                var delay = parseInt((Math.random() * 30000000) % 1000, 10);
                curCount++;
                console.log('现在的并发数是', curCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');

                // personInfo(url)
                getDetail(url)

                setTimeout(function() {
                    curCount--;
                    callback(null,url +'Call back content');
                }, delay);
            };

            // 使用async控制异步抓取
            // mapLimit(arr, limit, iterator, [callback])
            // 异步回调
            async.mapLimit(articleUrls, 10 ,function (url, callback) {
                console.log(articleUrls)
                console.log(articleUrls.length)
                reptileMove(url, callback);
            }, function (err,result) {
                // 4000 个 URL 访问完成的回调函数
                // ...
                fs.writeFile("list.js",JSON.stringify(articleInfo,null,"\t"), err => {
                    if(!err) console.log("success~");
                });
                fs.writeFile("result.js",JSON.stringify(detailArr,null,"\t"), err => {
                    if(!err) console.log("success~");
                });

            });
        });
    }
    http.createServer(onRequest).listen(3000);
}
exports.start= start;