// require libs
var express = require('express'),
    bodyParser = require('body-parser');

// const
const PORT = process.env.PORT || 3000;
HOST = process.env.HOST || 'localhost';

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

// data for test
data = [{
    name: 'Rocky Wall',
    image: 'https://images.unsplash.com/photo-1456426143385-2d6ae5764c6e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=996642306e825c9c9d55cccf87b6ebf5&auto=format&fit=crop&w=800&q=60'
}, {
    name: 'River Reef',
    image: 'https://images.unsplash.com/photo-1463559529332-35b893e83ec2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=569bd7316bd84fbd155c63f51afb1d59&auto=format&fit=crop&w=800&q=60',
}, {
    name: 'Mist Ground',
    image: 'https://images.unsplash.com/photo-1461274504020-af995bc53281?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4b6febd919d402c5833e727429360cd7&auto=format&fit=crop&w=800&q=60'
}]

// Home page
app.get('/', (req, res) => {
    res.render('landing');
});

// Campgrounds page
app.get('/campgrounds', (req, res) => {
    res.render('campgrounds', {
        campgrounds: data
    });
});

// Campgrounds new
app.get('/campgrounds/new', (req, res) => {
    res.render('new');
});

// Campground create
app.post('/campgrounds', (req, res) => {
    var newCampground = {
        name: req.body.name,
        image: req.body.image
    };
    data.push(newCampground);
    res.redirect('/campgrounds');
})

// Other page
app.get('/', (req, res) => {
    res.send('Page not found');
});

// start server
app.listen(PORT, HOST, () => {
    console.log('Server running at http://' + HOST + ':' + PORT);
})