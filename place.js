const users = [];

// join chat
function newUser(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// get user
function getActiveUser(id) {
  return users.find(user => user.id === id);
}


// Get room
function getIndividualRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function getAllusers() {
	return users;
}

module.exports = {
  newUser,
  getActiveUser,
  getIndividualRoomUsers,
	getAllusers
};