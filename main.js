var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = require('./lib/db');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathName = url.parse(_url,true).pathname;

    console.log(url.parse(_url,true));
    
    if(pathName==='/'){
        if(queryData.id === undefined){
            /* fs.readdir('./data', (error,data)=>{
                var title ="welcmoe"
                var description = "Hello, Node.js";
                var list =template.list(data);
                
                var html = template.html(title,list,`<h2>${title}</h2>${description}`,
                    '<a href="/create">create</a>');
                response.writeHead(200);
                response.end(html);
            }); */
            db.query(`SELECT * FROM topic`, (error,topics)=>{
                if(error){
                    throw error;
                }
                var title ="welcmoe"
                var description = "Hello, Node.js";
                var list =template.list(topics);
                var html = template.html(title,list,`<h2>${title}</h2>${description}`,
                    '<a href="/create">create</a>');

                response.writeHead(200);
                response.end(html);
            })
        }else{
            /* fs.readdir('./data', (error,data)=>{
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`,'utf-8', (err,description)=>{
                    var list =template.list(data);
                    var title=queryData.id;
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizeddescription = sanitizeHtml(description,{ 
                        aloowedTags: ['h1']});
                    
                    var html = template.html(title,list,`<h2>${sanitizedTitle}</h2>${sanitizeddescription}`,
                    `<a href="/create">create</a>
                    <a href="/update?id=${sanitizedTitle}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}"/>
                        <input type="submit" value="delete"/>
                    </form>`);
                    response.writeHead(200);
                    response.end(html);
                });
            }); */
            db.query(`SELECT * FROM topic`, (error,topics)=>{
                var filteredId = path.parse(queryData.id).base;
                if(error){
                    throw error;
                }
                db.query(`SELECT * FROM topic t LEFT JOIN author a ON t.author_id = a.id  WHERE t.id=?`,[filteredId], (error2,topic)=>{
                    if(error2){
                        throw error2;
                    }
                    var title =topic[0].title;
                    var description = topic[0].description;
    
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizeddescription = sanitizeHtml(description,{ 
                        aloowedTags: ['h1']});
    
                    var list =template.list(topics);
                    var html = template.html(sanitizedTitle,list,
                        `<h2>${sanitizedTitle}</h2>${sanitizeddescription}
                        <p>by ${topic[0].name}</p>`,
                        `<a href="/create">create</a>
                        <a href="/update?id=${filteredId}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${filteredId}"/>
                            <input type="submit" value="delete"/>
                        </form>`);
    
                    response.writeHead(200);
                    response.end(html);

                });
                
            });
        }
    }else if(pathName==="/create"){
        /* fs.readdir('./data', (error,data)=>{
            var title="Web-Create";
            var list =template.list(data);
            var html = template.html(title,list,`
            <form action="/create_process" method="POST">
                <p><input type="text" name= "title" placeholder="title"/></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>     
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `,'');
            response.writeHead(200);
            response.end(html);
        }); */

        db.query(`SELECT * FROM topic`, (error,topics)=>{
            if(error){
                throw error;
            }
            db.query(`SELECT * FROM author`, (error2,authors)=>{
                
                var title = 'Create';
                var list =template.list(topics);
                var html = template.html(title,list,
                `<form action="/create_process" method="POST">
                <p><input type="text" name= "title" placeholder="title"/></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>     
                </p>
                <p>
                    ${template.authorSelect(authors)}
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>`,'');
    
                response.writeHead(200);
                response.end(html);
            });
        });

    }else if(pathName==='/create_process'){
        let body ='';
        console.log("ffff")
        request.on('data',data=>{
            body += data;
            console.log();
        });
        request.on('end',()=>{
            let post = qs.parse(body);
            let title = post.title;
            let description = post.description;
            /* fs.writeFile(`data/${title}`,description,'utf-8',(err)=>{
                response.writeHead(302,{
                    Location:`/?id=${title}`
                });
                response.end('sucess');
            }) */
            db.query(`INSERT INTO topic (title, description, created, author_id)
             VALUES(?, ?, NOW(), ?)`,
             [post.title, post.description, post.author],
             (error,result)=>{
                 if(error){
                     throw error;
                 }
                 response.writeHead(302,{
                    Location:`/?id=${result.insertId}`
                });
                response.end('sucess');
             })
        });
    }else if(pathName==='/update'){
        /* fs.readdir('./data',(error,data)=>{
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf-8', (err,description)=>{
                let title = queryData.id;
                let list = template.list(data);
                let html = template.html(title, list,
                    `<form action="/update_process" method="POST">
                    <input type="hidden" name="id" value="${title}"/>
                    <p><input type="text" name= "title" placeholder="title" value="${title}"/></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>     
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                    </form>`,
                    ''
                );
                response.writeHead(200);
                response.end(html);
            });
        }); */
        db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], (error2,topic)=>{
            if(error2){
                throw error2;
            }
            db.query(`SELECT * FROM topic`, (error,topics)=>{
                if(error){
                    throw error;
                }
                db.query(`SELECT * FROM author`, (error2,authors)=>{
                
                    var id = topic[0].id;
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list =template.list(topics);
                    var html = template.html(title,list,
                        `<h3>Update</h3>
                        <form action="/update_process" method="POST">
                        <input type="hidden" name="id" value="${id}"/>
                        <p><input type="text" name= "title" placeholder="title" value="${title}"/></p>
                        <p>
                        <textarea name="description" placeholder="description">${description}</textarea>     
                        </p>
                        <p>
                            ${template.authorSelect(authors,topic[0].author_id)}
                        </p>
                        <p>
                        <input type="submit">
                        </p>
                        </form>`,
                        '');
                        
                        response.writeHead(200);
                        response.end(html);
                    
                });
            });
        });

    }else if(pathName==='/update_process'){
        let body ='';
        request.on('data', data=>{
            body+=data;
        });
        request.on('end',()=>{
            let post=qs.parse(body);
            let id = post.id;
            let title = post.title;
            let description = post.description;
            /* fs.rename(`data/${id}`, `data/${title}`,err=>{
                fs.writeFile(`data/${title}`, description,'utf-8'
                ,err=>{
                    response.writeHead(302,{Location:`/?id=${title}`});
                    response.end();
                })
            }) */
            db.query(`UPDATE topic SET title=?, description= ?, author_id=?  
            WHERE id=?`,[post.title, post.description, post.author, post.id],
            (error3, result)=>{
                if(error3){
                    throw error3;
                }
                response.writeHead(302,{
                    Location:`/?id=${post.id}`
                });
                response.end();
            });

        });
    }else if(pathName==='/delete_process'){
        let body ='';
        request.on('data', data=>{
            body+=data;
        });
        request.on('end',()=>{
            let post=qs.parse(body);
            /* let id = post.id;
                var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`,err=>{
                response.writeHead(302, {Location:`/`});
                response.end();
            }); */ 
            db.query(`DELETE FROM topic WHERE id=?`,[post.id], (error, result)=>{
                         if(error){
                             throw error;
                         }
                         response.writeHead(302,{
                             Location : `/`
                         });
                         response.end();
                     })
        });
        
    }else{
        response.writeHead(404);
        response.end('Not found');
    }
    
    
});
app.listen(3000);