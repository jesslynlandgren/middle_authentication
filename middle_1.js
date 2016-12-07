const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const app = express();

var users = {'test_user': 'test_password'};
var tokens = {};

app.set('view engine', 'hbs');
app.use(bodyParser.json());

function auth(request, response, next) {
    console.log(tokens);
    if (request.query.token in tokens) {
        next();
    } else {
        response.status(401);
        response.json({ error: 'You must be logged in to do this' });
    }

}

function middle(request, response, next) {
    var log = 'method: ' + request.method + '\npath: ' + request.path + '\n';
    fs.appendFile('log.txt', log, function(err){
        if (err) {
            response.status(500);
            response.json({ error: 'Request not valid' });
        } else {
            next();
        }
    });
}

app.post('/api/login', function(request, response){
    var username = request.body.username;
    var password = request.body.password;
    if (username in users && users[username] === password){
        var rand = function() {
            return Math.random().toString(36).substr(2); // remove `0.`
        };

        var createToken = function() {
            return rand() + rand(); // to make it longer
        };
        var token = createToken();
        tokens[token] = username;
        response.json({
            username: username,
            token: token
        });
        console.log(tokens);
    } else {
        response.status(401);
        response.json({
          error: 'Username or password not valid!'
        });
    }
});

app.get('/', auth, middle, function(request, response){
    response.send('Hello World!');
});

app.put('/documents/:file', auth, middle, function (request, response){
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

app.get('/documents/:file', auth, middle, function (request, response){
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

app.get('/documents/:file/display', auth, middle, function (request, response){
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

app.get('/documents', auth, middle, function (request, response){
    fs.readdir('./data/', function(err, files){
        if (err){
            response.status(500).json({message: 'Cannot access directory', error: err.message});
        }
        response.send(files);
    });
});

app.delete('/documents/:file', auth, middle, function (request, response){
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
