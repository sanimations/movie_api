const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

let queerFilms = [
    {
        title: 'Tangerine',
        director: 'Sean Baker'
    },
    {
        title: 'Happy Together',
        director: 'Wong Kar-Wai'
    },
    {
        title:'Love, Simon',
        director: 'Greg Berlanti'
    },
    {
        title: 'The Watermelon Woman',
        director: 'Cherly Dunye'
    },
    {
        title: 'Saving Face',
        director: 'Alice Wu'
    },
    {
        title: 'But I\'m a Cheerleader',
        director: 'Jamie Babbit'
    },
    {
        title: 'Moonlight',
        director: 'Barry Jenkins'
    },
    {
        title: 'Portrait of a Lady on Fire',
        director: 'Céline Sciamma'
    },
    {
        title: 'Paris is Burning',
        director: 'Jennie Livingston'
    },
    {
        title: 'Pariah',
        director: 'Dee Rees'
    },
    {
        title: 'Beginners',
        director: 'Mike Mills'
    }
]
let users = [
    {
        username: 'Mas52yaG',
        email: 'notFakeEmail@yahoo.com',
        LGBT: 'Queer',
        id: 1
    },
    {
        username: 'UtBakaksrshiHA',
        email: 'coolTutors@careerfoundry.com',
        LGBT: '',
        id: 2   
    },
    {
        username: 'coDDrew',
        email: 'mentororing@careerfoundry.com',
        LGBT: '',
        id: 3
    }
]

app.use(morgan('common'));

//Get list of all movies
app.get('/movies', (req, res) => {
    res.json(queerFilms);
})

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my app');
});

app.get('documentation.html', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//Gets one movie's data by entering in the title
app.get('/movies/:title', (req, res) => {
    res.json(queerFilms.find((movie) =>
      { return movie.title === req.params.title }));
});

//Gets one director's data by entering in their name
app.get('/movies/:director', (req, res) => {
    res.json(queerFilms.find((name) =>
      { return name.director === req.params.director }));
});

//Allows a new user to register
app.post('/users', (req, res) => {
    let newUser = req.body;
  
    if (!newUser.username) {
      const message = 'Missing username in request body';
      res.status(400).send(message);
    } else {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).send(newUser);
    }
});

//Allows users to update their username  
app.put('/users/:username/', (req, res) => {
    let user = users.find((user) => { return user.username === req.params.username });
  
    if (user) {
      user.username = req.params.username;
      res.status(201).send(req.params.username + ' will be the new username');
    } else {
      res.status(404).send('User with the username ' + req.params.username + ' was not found.');
    }
});

//Allows users to delete their user profile
app.delete('/users/:id', (req, res) => {
    let user = users.find((user) => {return user.id === req.params.id});

    if(user){
        users = users.filter((obj) => { return obj.id !== req.params.id});
        res.status(201).send('User ' + req.params.id + ' was deleted.');
    }
});
  
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined',{stream: accessLogStream}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is broken!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});




    //These should all be beefore app.listen, leaving these here in case morgan doesn't work
// let myLogger = (req, res, next) => {
//     console.log(req.url);
//     next();
// };

// let requestTime = (req, res, next) => {
//     req.requestTime = Date.now();
//     next();
// };

// app.use(myLogger);
// app.use(requestTime);

// app.get('/', (req, res)=> {
//     let responseText = 'Welcome to my app!';
//     responseText += '<small>Requested at: ' + req.requestTime + '<small>';
//     res.send(responseText);
// });

// app.get('/secreturl', (req, res) => {
//     let responseText = 'This is a secret url with super top-secret content.';
//     responseText += '<small>Requested at: ' + req.requestTime + '<small>';
//     res.send(responseText);
// });