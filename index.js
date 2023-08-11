const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    cors = require('cors'),
    Models = require('./models.js');


//mongoose.connect('mongodb://127.0.0.1/cfDB?directConnection=true', { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express();
const Movies = Models.Movie;
const Users = Models.User;
const { check, validationResult } = require('express-validator');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
//let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
//app.use(cors()) can be used for letting any domain access this API

app.use(cors());
// {
//     origin: (origin, callback) => {
//     if(!origin) return callback(null, true);
//     if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list
//       let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
//       return callback(new Error(message ), false);
//     }
//     return callback(null, true);
//   }
// }));

let auth = require('./auth')(app); //This is the link to the authorization
const passport = require('passport');
require('./passport');

//Get list of all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.post('/login', (req, res) => {
    const { access, secret } = req.body;

    Users.findOne({ Username: access })
        .then((user) => {
            if (!user || !user.validatePassword(secret)) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }

            const token = Users.generateJWT(user);
            return res.json({ user: user.Username, token });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

//Gets one movie's data by entering in the title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Gets one director's data by entering in their name
app.get('/movies/directors/:Director', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Director })
        .then((dir) => {
            res.json(dir.Director.Bio + " Birthyear: " + dir.Director.Birth);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Gets the definition of a genre
app.get('/movies/genres/:Genre', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Genre })
        .then((gen) => {
            res.json(gen.Genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Allows a new user to register expected in JSON format
app.post('/users',
    /*Validation logic here for request. Make sure username has at least 5 characters and 
    contains alphanumeric characters only.  Make sure there is a password and it also has 
    a length of at least 5.  Make sure email is valid
    */
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
        //check the validation objects for errors
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({ Username: req.body.Username })  //Search to see if username already exists
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + 'already exists');
                } else {
                    Users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
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
app.put('/users/:Username',
    [
        check('Username', 'Username is required').isLength({ min: 5 }),  //'Username' takes from req.body
        check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'You cannot change your password here.').isEmpty(),
        check('Email', 'You cannot change your email here.').isEmpty()
    ], passport.authenticate('jwt', { session: false }), async (req, res) => {
        //check the validation objects for errors
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        await Users.findOneAndUpdate({ Username: req.params.Username }, {
            $set:
            {
                Username: req.body.Username
            }
        },
            { new: true }).then((user) => {
                if (user) {
                    res.json(user);
                    console.log('2');
                } else {
                    console.log('3');
                    res.status(500).send('Something went wrong');
                }
            })
    });
//Allows users to delete their user profile
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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

//Allows users to add to favorites// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const movieId = new mongoose.Types.ObjectId(req.params.MovieID);

    try {
        const updatedUser = await Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $push: { FavoriteMovies: movieId } },
            { new: true }
        );

        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

//Delete a movie from your list of movies
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const movieId = new mongoose.Types.ObjectId(req.params.MovieID);

    try {
        const updatedUser = await Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $pull: { FavoriteMovies: movieId } },
            { new: true }
        );

        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })

app.use(morgan('combined', { stream: accessLogStream }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is broken!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Your app is listening on port ' + port);
});