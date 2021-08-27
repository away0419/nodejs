const { response } = require('express');
const express = require('express');
const app = express();
const fs = require('fs');



const bodyParser = require('body-parser');
const compression = require('compression');
const topicRouter = require('./routes/topic');
const indexRouter = require('./routes/index');

//미들웨어 parames 받기
//form 요청일경우
app.use(bodyParser.urlencoded({extended: false}));
/* //json 일 경우
app.use(bodyParser.json()); */

//정적인 파일 서비스
app.use(express.static('public'));//이미지를 불러오기 위해선 경로를 server에 라우팅 해야 한다.
//라우팅하면 url로 이 폴더에 접근이 가능해 진다.



//미들웨어
//내용 압축하기
app.use(compression());
//미들웨어 직접 만들기 (모든곳에 적용)
/* app.use((req,res,next)=>{
  fs.readdir('./data', (error, filelist)=>{
    req.list=filelist;
    next();
  })
}) */

//미들웨어 만들기 (get의 모든 곳에 적용) => 기본으로 쓰던 app.get도 당연히 미들웨어임.(방식이 같이때문)
app.get('*',(req,res,next)=>{
  fs.readdir('./data', (error, filelist)=>{
    req.list=filelist;
    next();
  })
})
//미들웨어 실행순서 => next()의 경우 코드상에 있는 바로 다음에 나오는 미들웨어를 실행한다.
//즉 자기안에 없다면 다음 줄에 있는 미들웨어를 실행한다.
//이때 next('route')가 된다면 나에게 포함된 미들웨어가아닌 다음 마음 미들웨어를 실행한다.
/* ex)
 app.get('*',(req,res,next)=>{
  if(req.params.id==='0') next('route) //다음에 오는 app.~ 의 미들웨어를 실행
  else next(); // 자신의 바로 다음 미들웨어를 실행
},(req,res,next)=>{
  res.render('regular');
})

app.get('/user/:id',(req,res,next)=>{
  res.render('special');
})
 */

app.use('/',indexRouter);
app.use('/topic',topicRouter); // topic 경로라면 topicRouter 라우터를 쓴다. body-parse보다 아래에 있어야함





app.use((req,res,next)=>{
  res.status(404).send('sorry');
});

app.use((err, req, res, next)=>{
  res.status(500).send('something');
});

app.listen(3000, ()=> console.log('Example app listening on port 3000!'));

/* var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
      } else {
        
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
      });
    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
            })
          });
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
    
});
app.listen(3000);
*/