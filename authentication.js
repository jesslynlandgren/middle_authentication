const express = require('express');
const app = express();
const randomString = require('randomstring');
// auth token - you would normally generate a random one
const token = 'Keep me a secret';
const bodyParser = require('body-parser');

app.use(bodyParser.json());

function auth(req, res, next) {
  // verify the authentication token
  if (req.query.token === token) {
    next()
  } else {
    res.status(401);
    res.json({ error: 'You are not logged in lol' });
  }
}

app.post('/api/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  // verify the login
  if (username === 'larry' && password === 'open') {
    // return the auth token, normally you would
    // generate a random one here, but we are
    // using a hardcoded token, see above
    res.json({
      username: username,
      token: token
    });
  } else {
    res.status(401);
    res.json({
      error: 'Login incorrect'
    });
  }
});

// make use of the auth middleware to validate
// that the user has been logged in
app.get('/api/data', auth, function(req, res) {
      var theData = [
        { name: 'blah' },
        { name: 'more blah' },
      ];
      res.json(theData);
    });

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
