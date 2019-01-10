const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

let messages = [
    {name: 'Zeus', message: 'Intelligence hero'},
    {name: 'Axe', message: 'Strength hero'},
    {name: 'Mortred', message: 'Agility hero'},
    {name: 'Spectre', message: 'Agility hero2'}
];

let users = [];

// Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

const api = express.Router();

app.use(bodyParser.json());

api.get('/', (req, res) => {
    res.send(`App Server started on port number ${process.env.PORT || 3000}`);
});

api.get('/messages', (req, res) => {
    res.json(messages);
});

api.get('/messages/:name', (req, res) => {
    let user = req.params.name;
    let result = messages.filter(message => message.name === user);
    res.json(result);
});

api.post('/messages', checkAuthenticated, (req, res) => {
    res.status(200).send(req.body);
});

api.get('/users/me', (req, res) => {
    console.log(req.user);  
});

api.post('/register', (req, res) => {
    let index = users.push(req.body) - 1;
    let user =  users[index];
    user.id = index;
    users.push(user);
    
    res.status(200).send({
        token: setToken(user),
        firstName: user.firstName,
        message: 'Registered User Successfully.'
    });
});

api.post('/login', (req, res) => {
    let loginUser = req.body;
    let user = users.find(user => user.email === loginUser.email);

    if (!user) {
        return res.status(200).send({
            success: false,
            message: 'Login failed.',
        });
    }

    if (user && user.password == loginUser.password) {
        res.status(200).send({
            firstName: user.firstName,
            token: setToken(user),
            success: true,
            message: 'Login Successfull.',
        });
    }

});

function checkAuthenticated(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).send({message: 'Unauthorized request. Missing authentication header.'});
    }

    let token = req.header('Authorization').split(' ')[1];
    let payload = jwt.decode(token, '123');

    if (!payload) {
        return res.status(401).send({message: 'Unauthorized request. Authorization header invalid.'})
    }

    req.user = payload;
    next();
}

function setToken(user) {
    return jwt.sign(user.id, '123');
}

app.use('/api', api);

app.listen(3000);