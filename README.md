# YelpCamp
My YelpCamp project credited by Colt Steele from Udemy allows users to add campgrounds, react and more fun stuffs to do.

## yelpcamp 1.0.0
In this version, you can:
1. Create new campground
2. See all campgrounds

### 1. Add routing
* GET home `/`
* GET campgrounds `/campgrounds`
    - have a generic campground array to test
    - pass `campgrounds` variable
* GET campground new `/campgrounds/new`
* POST `/campgrounds`
    - add it to array
    - redirect to campgrounds
* GET other `/crazy_stuff`
    - send a message
### 2. Add page views
* header & footer
    - bootstrap
    - navbar
    - links
* landing
    - link to campgrounds
* campgrounds
    - jumbotron & button add new
    - grid of campgrounds
* campgrounds/new
    - form

## yelpcamp 1.3.0
Implemented features
1. mongodb local database

In this version, you can:
1. Access a campground page
2. Edit, remove a campground

### 1. Add routing
* GET campground page `/campgrounds/:id`
    - get the id
    - find the campground
    - pass the found campground to a file
* GET campground edit `/campgrounds/:id/edit`
    - pass a specific `campground` variable
* PUT campground update`/campgrounds/:id`
    - create a new campground var with data from the form
    - find that campground with update that campground
    - redirect to that campground page
* DELETE campground delete `/campgrounds/:id`
    - delete that campground using its id
### 2. Add page views
* edit
    - displace a form
    - retrieve data from campground variable
### 3. Config mongoose
* mongoose connect
* add campground model
* rewrite the campgrounds POST handler
* rewrite the campgrounds GET handler

## yelpcamp 2.1.0
Implementation
1. Add description, price
2. Restyle show page, campgrounds
3. User model
4. Comment model
5. Login, register with passportjs
6. refactor the code

In this version, you can:
1. Create campground with description and price
2. Login, register, logout
3. Comment on campgrounds

### yelpcamp 2.4.0
Implementation
1. add middleware to grant permission
2. add name, photo, bio, created campground to author
3. add author to campground
4. allow to edit, remove comment
5. allow to edit user profile
6. add css to style comments

