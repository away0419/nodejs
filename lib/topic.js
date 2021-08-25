var db = require('./db');
var template = require('./template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var url = require('url');
var qs = require('querystring');

exports.home =(request,response)=>{ 
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
    });
}

exports.page =(request,response,_url,queryData)=>{ 
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
exports.create =(request,response,_url)=>{ 
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
}
exports.create_process =(request,response,_url)=>{ 
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
}
exports.update =(request,response,_url,queryData)=>{ 
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
}
exports.update_process =(request,response,_url)=>{ 
    let body ='';
        request.on('data', data=>{
            body+=data;
        });
        request.on('end',()=>{
            let post=qs.parse(body);
            let id = post.id;
            let title = post.title;
            let description = post.description;
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
}
exports.delete_process =(request,response,_url)=>{ 
    let body ='';
        request.on('data', data=>{
            body+=data;
        });
        request.on('end',()=>{
            let post=qs.parse(body);
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
}
