const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

let queerFilms = [
    {
        title: 'Tangerine',
        director: 'Sean Baker',
        genres: ['Drama', ' Comedy'],
        favorites: false
    },
    {
        title: 'Happy Together',
        director: 'Wong Kar-Wai',
        genres: ['Romance', ' Drama'],
        favorites: false       
    },
    {
        title:'Love, Simon',
        director: 'Greg Berlanti',
        genres: ['Romance', ' Comedy', ' ComingOfAge'],
        favorites: false
    },
    {
        title: 'The Watermelon Woman',
        director: 'Cherly Dunye',
        genres: ['Comedy', ' Romance'],
        favorites: false
    },
    {
        title: 'Saving Face',
        director: 'Alice Wu',
        genres: ['Romance', ' Comedy'],
        favorites: false
    },
    {
        title: 'But I\'m a Cheerleader',
        director: 'Jamie Babbit',
        genres: ['Comedy', ' Romance', ' Satire'],
        favorites: false
    },
    {
        title: 'Moonlight',
        director: 'Barry Jenkins',
        genres: ['Drama', ' ComingOfAge'],
        favorites: false
    },
    {
        title: 'Portrait of a Lady on Fire',
        director: 'Céline Sciamma',
        genres: ['Romance' , ' Drama', ' History'],
        favorites: false
    },
    {
        title: 'Paris is Burning',
        director: 'Jennie Livingston',
        genres: ['Documentary'],
        favorites: false
    },
    {
        title: 'Pariah',
        director: 'Dee Rees',
        genres: ['Drama'],
        favorites: false
    },
    {
        title: 'Beginners',
        director: 'Mike Mills',
        genres: ['Romance', 'Comedy'],
        favorites: false
    }
]
let users = [
    {
        name: 'Sam',
        username: 'Mas52yaG',
        email: 'notFakeEmail@yahoo.com',
        LGBT: 'Queer',
        id: '1'
    },
    {
        name: 'Utkarsha',
        username: 'UtBakaksrshiHA',
        email: 'coolTutors@careerfoundry.com',
        LGBT: '',
        id: '2'   
    },
    {
        name: 'Drew',
        username: 'coDDrew',
        email: 'mentororing@careerfoundry.com',
        LGBT: '',
        id: '3'
    }
]

let genreList = [
    {
        Comedy: 'professional entertainment consisting of jokes and satirical sketches, intended to make an audience laugh.' 
    }, 
    {
        Romance: 'One or more characters fall in love'
    },
    {
        Satire: 'the use of humor, irony, exaggeration, or ridicule to expose and criticize people\'s stupidity or vices, particularly in the context of contemporary politics and other topical issues.'
    }, 
    {
        ComingOfAge: 'A young person\'s transition from child to adulthood'
    }, 
    {
        Drama: 'an emotional or unexpected series of events or set of circumstances.'
    }, 
    {
        Documentary: 'A documentary film or documentary is a non-fictional motion-picture intended to "document reality, primarily for the purposes of instruction, education or maintaining a historical record'
    }, 
    {
        History: 'Set in a specific time-period that greatly influences the plot'
    }
]

app.use(morgan('common'));

//Get list of all movies
app.get('/movies', (req, res) => {
    res.json(queerFilms);
})

//Get list of all users
app.get('/users', (req, res) => {
    res.json(users);
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

//Gets teh definition of a genre
app.get('/:genre', (req, res) => {
    res.json(genreList.find((genre) =>
      { return genre === req.params.genre }));
});

//Allows a new user to register
app.post('/users', (req, res) => {
    let newUser = req.body;
  
    if (!newUser.name) {
      const message = 'Missing name in request body';
      res.status(400).send(message);
    } else {
      users.push(newUser);
      res.status(201).send(newUser);
    }
});

//Allows users to update their username  
app.put('/users/:name/:username/', (req, res) => {
    let user = users.find((user) => { return user.name === req.params.name });
  
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

//Allows users to add to favorites
app.put('/movies/:title/:favorites', (req, res) => {
    let favList = queerFilms.find((favList) => { return favList.title === req.params.title });
  
    if (favList) {
      favList.favorites = req.params.favorites;
      res.status(201).send( req.params.title + ' was added to your favorites!');
    } else {
      res.status(404).send(req.params.title + ' was not found.');
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