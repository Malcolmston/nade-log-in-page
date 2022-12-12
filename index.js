const {
	crateTable,
	addNewuser,
	getNewlogIn,
	validate,
	isEmpty,
	getAll,

	createChat,
	addNewChat,
	getChats,

	createRooms,
	addNewuserRoom,
	GetRoom
} = require("./sql.js")

const {
	newUser,
	getActiveUser,
	getIndividualRoomUsers,
	getAllusers
} = require("./place.js")


var express = require("express")
var app = express()

var http = require('http').Server(app);
var path = require('path');

//var server = require("http").Server(http);
var bodyParser = require('body-parser')
const router = express.Router();

const io = require('socket.io')(http);

const session = require('express-session');


const login = '/accountPage.html'
const chat = '/homePage.html'
const port = process.env.PORT || 3000




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

				request.session.you = request.body

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


/*
		io.on('connection', socket => {
			socket.emit('allUsers', getAllusers())

			socket.emit('joinRoom', { username: request.session.ussername, room: 'hi' })
			//socket.emit('logedin', request.session.ussername)

			socket.on('joinRoom', ({ username, room }) => {
				let user = newUser(socket.id, username, room);

				socket.join(user.room);

				// General welcome
				socket.emit('message', 'Messages are limited to this room!');



				socket.on('chatMessage', msg => {
					let user = getActiveUser(socket.id);

					console.log(user)
					io.to(user.room).emit('message', msg);
				});

				
socket.emit('allUsers', getAllusers())

				// Current active users and room name
				io.to(user.room).emit('roomUsers', {
					room: user.room,
					users: getIndividualRoomUsers(user.room)
				});
			});

			socket.on('getallUsers',() => {
				socket.emit('allUsers', getAllusers())
			})

			

		})
*/




		// Output username
		//response.send('Welcome back, ' + request.session.ussername + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');

	}
	//response.end();
})

app.use('/', router);




http.listen(port, () => {
	console.log(`Socket.IO server running at http://localhost:${port}/`);
});

