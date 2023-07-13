const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    //cors = require('cors'),
    Models = require('./models.js');


mongoose.connect('mongodb://127.0.0.1/cfDB?directConnection=true', { useNewUrlParser: true, useUnifiedTopology: true});
const app = express();
const Movies = Models.Movie;
const Users = Models.User;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
/*let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
                    //app.use(cors()) can be used for letting any domain access this API
app.use(cors({
    origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));
*/
let auth = require('./auth')(app); //This is the link to the authorization
const passport = require('passport');
require('./passport');

//Get list of all movies
app.get('/movies', passport.authenticate( 'jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get list of all users
app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my app');
});

app.get('documentation.html', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//Gets one movie's data by entering in the title
app.get('/movies/:Title', passport.authenticate( 'jwt', { session: false }), (req, res) => {
    Movies.findOne( {Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Gets one director's data by entering in their name
app.get('/movies/directors/:Director', passport.authenticate( 'jwt', { session: false }), (req, res) => {
    Movies.findOne( {'Director.Name': req.params.Director })
        .then((dir) => {
            res.json(dir.Director.Bio);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Gets the definition of a genre
app.get('/movies/genres/:Genre', passport.authenticate( 'jwt', { session: false }), (req, res) => {
    Movies.findOne( {'Genre.Name': req.params.Genre})
        .then((gen) => {
            res.json(gen.Genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Allows a new user to register expected in JSON format
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

//Allows users to update their username  
app.put('/users/:Username', passport.authenticate( 'jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {   
            Username: req.body.Username
        }
    },
        { new: true }).then((user) => { 
            if(user){
                res.json(user);
                console.log('2');
            } else {
                console.log('3');
                res.status(500).send('Something went wrong');
            }
        }) 
    });
//Allows users to delete their user profile
app.delete('/users/:Username', passport.authenticate( 'jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found!');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.  We\'ll miss you!');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Allows users to add to favorites
app.put('/users/:Username/movies/:MovieID', passport.authenticate( 'jwt', { session: false }), (req, res) => {
    app.post('/users/:Username/movies/:MovieID', (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username }, {
            $push: { FavoriteMovies: req.params.MovieID }
        },
            { new: true }, // makes sure updated document is returned
            (err, updatedUser) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                } else {
                    res.json(updatedUser);
                }
            });
    });
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