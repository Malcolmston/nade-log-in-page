const {
	addNewuser,
	getNewlogIn,
	validate,
	isEmpty,
	getAll,
	createChat,
	addNewChat,
	getChats
} = require('./sql.js');



var http = require('http');
var path = require('path');
var express = require("express"),
	app = express(),
	server = require("http").Server(app);
var bodyParser = require('body-parser')
const router = express.Router();

const session = require('express-session');
const fs = require('fs')

const login = '/accountPage.html'
const chat = '/homePage.html'

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


app.get('/', function(req, res) {
	//get login file
	res.sendFile(path.resolve(__dirname + login));
});


// http://localhost:3000/signup
app.post('/signup', function(request, response) {
	// gets the input fields
	let ussername = request.body.ussername;
	let password = request.body.password;
	// makes sure the input fields exists and are not empty
	if (ussername && password) {
		validate(ussername, password).then(function(params) {
			if (!params) {
				request.session.loggedin = true;
				request.session.ussername = ussername;

				addNewuser(ussername, password).then(console.log)

				response.redirect('/home')
			} else {
				response.send('an account with that username already exsits!')
			}
		})
	} else {
		response.send('Please enter username and Password!');
		response.end();
	}


});

app.post('/login', function(request, response) {
	// gets the input fields
	let ussername = request.body.ussername;
	let password = request.body.password;
	// makes sure the input fields exists and are not empty

	if (ussername && password) {
		validate(ussername, password).then(function(params) {
			if (params) {
				request.session.loggedin = true;
				request.session.ussername = ussername;

				response.redirect('/home')
				response.end();
			} else {
				response.send('incorrect username and/or password!');
			}
		})
	} else {
		response.send('Please enter username and Password!');
		response.end();
	}


})

app.post('/logout', function(request, response) {
	request.session.ussername = undefined;
	request.session.loggedin = false;

	response.redirect('/')
})

app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		//next file
		//response.sendFile(path.resolve(__dirname + login));
		response.sendFile(path.join(__dirname + chat));

		// Output username
		//response.send('Welcome back, ' + request.session.ussername + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');

	}
	//response.end();
})



app.use('/', router);


server.listen(process.env.PORT || 3030);