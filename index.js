const express = require('express'),
    morgan = require('morgan');

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

app.use(morgan('common'));

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