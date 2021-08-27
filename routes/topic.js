const express = require('express');
const router = express.Router(); // router 생성
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const template = require('../lib/template');


//page 페이지 퀴리가아닌 path로 parame 보내는 방법
/* app.get('/page/:pageId/', (req, res) => { // /page/CSS 접속시 => req.parames = {pageId : CSS}
  res.send(req.params);
}); */
router.get('/create',(req,res)=>{ // 밑의 라우팅 /topic/:pageId와 겹치므로 이걸 아래보다 위에 위치시켜야함
    fs.readdir('./data',(err1,filelist)=>{
      var title = 'WEB - create';
          var list = template.list(filelist);
          var html = template.HTML(title, list, `
            <form action="/topic/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `, '');
          res.send(html);
    });
  });
  
  router.post('/create_process', (req,res)=>{
    /* let body="";
    req.on('data', data=>{
      body+=data;
    });
    req.on('end',()=>{
      let post = qs.parse(body);
      let title = post.title;
      let description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        res.writeHead(302, {Location: `page/${title}`});
        res.end();
      })
    }); */
    //body-parser 이용할 경우
    console.log('adfasd');
    let post = req.body;
    let title = post.title;
    let description = post.description;
    console.log('adfasd');
    fs.writeFile(`data/${title}`, description, 'utf-8', function(err){
      res.redirect(`/topic/${title}`);
    });
  });
  
  router.get('/update/:updateId',(req,res)=>{
    fs.readdir('./data',(error1,filelist)=>{
      let filteredId = path.parse(req.params.updateId).base;
      fs.readFile(`./data/${req.params.updateId}`,'utf-8',(error2,description)=>{
        let title = filteredId;
        let list = template.list(filelist);
        let html = template.HTML(title, list,
          `
          <form action="/topic/update_process" method="post">
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
          `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
        );
        res.send(html);
      });
    });
  });
  
  router.post('/update_process',(req,res)=>{
    /* let body = "";
    req.on('data',(data)=>{
      body+=data;
    });
    req.on('end',()=>{ */
      var post = req.body;
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          res.redirect(`/topic/${title}`);
        })
      });
    /* }) */
  });
  
  router.post('/delete_process',(req,res)=>{
    /* var body = '';
    req.on('data', function(data){
      console.log(data);
      body = body + data;
    });
    req.on('end', function(){ */
        var post = req.body;
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(error){
          res.redirect(`/`);
        })
    /* }); */
  });
  
  router.get('/:pageId/', (req, res, next) => {
    fs.readdir('./data', function(error, filelist){
      var filteredId = path.parse(req.params.pageId).base;
      fs.readFile(`data/${filteredId}`, 'utf-8', function(err, description){
        if(err){
          next(err);// 에러 던지기 여기선 500에러
        }else{
          var title = req.params.pageId;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description, {
            allowedTags:['h1']
          });
          var list = template.list(filelist);
          var html = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            ` <a href="/topic/create">create</a>
              <a href="/topic/update/${sanitizedTitle}">update</a>
              <form action="/topic/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
              </form>`
          );
          res.send(html);
        }
      });
    });
  });

  module.exports =router;