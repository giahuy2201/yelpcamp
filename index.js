// require libs
var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose');

// const
const PORT = process.env.PORT || 3000;
HOST = process.env.HOST || 'localhost';

var app = express();
// connect to database
mongoose.connect('mongodb://localhost/yelpcamp1', {
    useNewUrlParser: true
});

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// create campground schema
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String
});
// create campground model
var Campground = mongoose.model('Campground', campgroundSchema);

// Home page
app.get('/', (req, res) => {
    res.render('landing');
});

// Campgrounds page
app.get('/campgrounds', (req, res) => {
    Campground.find((err, campgrounds) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            // render index page
            res.render('campgrounds', {
                campgrounds: campgrounds
            });
        }
    })
});

// Campgrounds new
app.get('/campgrounds/new', (req, res) => {
    res.render('new');
});

// Campground create
app.post('/campgrounds', (req, res) => {
    // make campground variable
    var newCampground = {
        name: req.body.name,
        image: req.body.image
    };
    Campground.create(newCampground, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/campgrounds');
        }
    })
})

// Campground show
app.get('/campgrounds/:id', (req, res) => {
    // get id from parameters
    var id = req.params.id;
    Campground.findById(id, (err, foundCampground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render('show', {
                campground: foundCampground
            });
        }
    })
});

// Campground edit
app.get('/campgrounds/:id/edit', (req, res) => {
    // get the id
    var id = req.params.id;
    Campground.findById(id, (err, foundCampground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render('edit', {
                campground: foundCampground
            });
        }
    })
});

// Campground update
app.put('/campgrounds/:id', (req, res) => {
    // get the id
    var condition = {
        _id: req.params.id
    };
    var newCampground = req.body.campground;
    Campground.findOneAndUpdate(condition, newCampground, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/campgrounds');
        }
    })
})

// Campground delete
app.delete('/campgrounds/:id', (req, res) => {
    // get the id
    var condition = {
        _id: req.params.id
    };
    Campground.findOneAndRemove(condition, (err) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/campgrounds');
        }
    })
})

// Other page
app.get('/', (req, res) => {
    res.send('Page not found');
});

// start server
app.listen(PORT, HOST, () => {
    console.log('Server running at http://' + HOST + ':' + PORT);
});