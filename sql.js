
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('uses.sqlite');
var Promise = require('promise');
const fetch = require('node-fetch');


Date.prototype.toFormat = function() {
	let r = this.toISOString().split('T')[0].replace(/-/g, '/').split('/')
	return r[2] + '/' + r[1] + '/' + r[0] + ' ' + (this.getHours() > 12 ? 'pm ' + (this.getHours() - 12) : 'am ' + this.getHours()) + ':' + this.getMinutes();

}

function generatePass(pLength) {
	charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
		retVal = "";
	for (var i = 0, n = charset.length; i < pLength; ++i) {
		retVal += charset.charAt(Math.floor(Math.random() * n));
	}
	return retVal;

}

function getAll(From = 'users') {
	return new Promise((resolve, reject) => {
		db.all(`SELECT * FROM ${From}`,
			[], (err, rows) => {
				if (err) {
					console.log(err)
					reject(err)

				} else {
					resolve(rows)
				}
			});
	})
}

function crateTable(name = 'users') {
	return new Promise((resolve, reject) => {
		db.serialize(function() {
			db.run(`CREATE TABLE IF NOT EXISTS ${name} (person_id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL)`);
			resolve('done')
		})
	})
}


//adds a new user with the headers
function addNewuser(username, password) {
	return new Promise((resolve, reject) => {
		db.serialize(function() {
			db.run("CREATE TABLE IF NOT EXISTS  users  (person_id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL)");
			var stmt = db.prepare("INSERT INTO users VALUES (?,?,?)");
			stmt.run(null, username, password);
			stmt.finalize();
			validate(username, password).then(function(ask) {
				if (!ask) {
					db.all("SELECT * FROM users",
						[],
						(err, rows) => {
							if (!err && !rows) {
								resolve(false)
							}
							if (err) {
								resolve(false)
								//reject(err)
							}
							resolve(true)
						});
				} else {
					resolve(false)
				}
			})
		})
	});
}
// get a new login
function getNewlogIn(username, password) {
	return new Promise((resolve, reject) => {
		db.all("SELECT * FROM users",
			[], (err, rows) => {
				if (!err && !rows) {
				}
				if (err) {
					reject(err)
				} else {
					let ans = rows.filter(function(x) {
						return x['username'] == username && x['password'] == password
					})
					resolve(ans)
				}
			});
	})
}
//asyncernisly get if users is empty
async function isEmpty() {
	var a;
	try {
		a = await getAll('users')
		return (a.length >= 1)
	} catch (error) {
		a = 'error'
		crateTable().then(function() {
			isEmpty()
		})
	}
}
//is the log in valid?
async function validate(username, password) {
	var ans = await getAll('users')
	//console.log( username, password )
	try {
		return ans.filter(function(x) {
			//(a | b) == 1 

			return x['username'] == username && x['password'] == password
		}).length >= 1
	} catch (error) {
		crateTable().then(function() {
			validate(username, password)
		})
	}
}



// this function adds chat to the chat server
function createChat(name = 'chat') {
	return new Promise((resolve, reject) => {
		db.serialize(function() {
			db.run("CREATE TABLE IF NOT EXISTS " + name + " (messageCode INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, who TEXT NOT NULL, date TEXT NOT NULL)");
			resolve('done')
		})
	})
}
//ads chat to message
function addNewChat(code, message, who) {
	let date = new Date().toFormat()
	return new Promise((resolve, reject) => {
		db.serialize(function() {
			db.run("CREATE TABLE IF NOT EXISTS chats (message_id INTEGER PRIMARY KEY AUTOINCREMENT, messageCode TEXT NOT NULL, message TEXT NOT NULL, who TEXT NOT NULL, date TEXT NOT NULL)");
			var stmt = db.prepare("INSERT INTO chats VALUES (?,?,?,?,?)");
			stmt.run(null, code, message, who, date);
			stmt.finalize();
			db.all("SELECT * FROM chats",
				[],
				(err, rows) => {
					if (err) {
						reject(err)
					}
					resolve(rows)
				});
		})
	});
}
//gets your chats
function getChats(code) {
	return new Promise((resolve, reject) => {
		db.serialize(function() {
			db.run("CREATE TABLE IF NOT EXISTS chats (message_id INTEGER PRIMARY KEY AUTOINCREMENT, messageCode TEXT NOT NULL, message TEXT NOT NULL, who TEXT NOT NULL, date TEXT NOT NULL)");
			db.all(`SELECT * FROM chats WHERE messageCode = '${code}'`,
				[],
				(err, rows) => {
					if (err) {
						console.log(err)
						createChat().then(function(params) {
							addNewChat(code, message, who)
						})
					} else {
						resolve(rows)
					}
				});
		})
	});
}
//db


function createRooms() {
	return new Promise((resolve, reject) => {
		db.serialize(function() {
			db.run("CREATE TABLE IF NOT EXISTS chatRoom (person_id INTEGER PRIMARY KEY AUTOINCREMENT, _From1 TEXT NOT NULL, _To1 TEXT NOT NULL, _From2 TEXT NOT NULL, _To2 TEXT NOT NULL, _Room_key TEXT NOT NULL)");
			resolve(true)
		})
	})
}

function addNewuserRoom(To, From, code = generatePass(50)) {
	return new Promise((resolve, reject) => {
		db.serialize(function() {
			db.run("CREATE TABLE IF NOT EXISTS chatRoom (person_id INTEGER PRIMARY KEY AUTOINCREMENT, _From1 TEXT NOT NULL, _To1 TEXT NOT NULL, _From2 TEXT NOT NULL, _To2 TEXT NOT NULL, _Room_key TEXT NOT NULL)");
			var stmt = db.prepare("INSERT INTO chatRoom VALUES (?,?,?,?,?,?)");
			stmt.run(null, To, From, From, To, code);
			stmt.finalize();
			resolve(true)
		})
	});
}

function GetRoom(to, from) {
	return new Promise((resolve, reject) => {
		db.all(`SELECT _Room_key FROM chatRoom WHERE (_From1 == '${from}' OR _From2 == '${from}') And (_To1 == '${to}' OR _To2 == '${to}')`,
			[], (err, rows) => {
				if (err) {
					console.log(err)
					reject(err)

				} else {
					resolve(rows)
				}
			});
	})
}


module.exports = {
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
}
