const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')

const app = express();

app.set('view engine', 'hbs');
app.use(bodyParser.json());

function middle(request, response, next) {
    var log = 'method: ' + request.method + '\npath: ' + request.path + '\n';
    fs.appendFile('log.txt', log, function(err){
        if (err) {
            res.status(500);
            res.json({ error: 'Request not valid' });
        } else {
            next();
        }
    });
}

function auth(request, response, next) {

}

app.post('/api/login', function(request, response){

});

app.get('/', middle, function(request, response){
    response.send('Hello World!');
});

app.put('/documents/:file', middle, function (request, response){
    let file = request.params.file;
    let filepath = './data/' + file;
    let contents = request.body.contents;
    fs.writeFile(filepath, contents, function(err) {
        if (err) {
            response.status(500);
            response.json({message: 'Error saving file', error: err.message});
        } else {
            response.json({message: 'File saved: ' + file});
        }
    });
});

app.get('/documents/:file', middle, function (request, response){
    let file = request.params.file;
    let filepath = './data/' + file;
    fs.readFile(filepath, function(err, buffer){
        if (err) {
            response.status(500).json({message: 'File not found', error: err.message});
        } else {
            response.json({file: file, contents: buffer.toString()});
        }
    });
});

app.get('/documents/:file/display', middle, function (request, response){
    let file = request.params.file;
    let filepath = './data/' + file;
    fs.readFile(filepath, function(err, buffer){
        if (err) {
            response.status(500).json({message: 'File not found', error: err.message});
        } else {
            response.render('display.hbs', {
              file: file,
              contents: buffer.toString()
            });
        }
    });
});

app.get('/documents', middle, function (request, response){
    fs.readdir('./data/', function(err, files){
        if (err){
            response.status(500).json({message: 'Cannot access directory', error: err.message});
        }
        response.send(files);
    });
});

app.delete('/documents/:file', middle, function (request, response){
    let file = request.params.file;
    let filepath = './data/' + file;
    fs.unlink(filepath, function(err, files){
        if (err) {
            response.status(500).json({message: 'File does note exist', error: err.message});
        } else {
            response.json({message: 'File deleted: ' + file});
        }
    });
});

app.listen(3000, function(){
    console.log('Listening on port 3000!');
});
