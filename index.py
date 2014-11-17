import web

web.config.debug = True

urls = ('/', 'index',
		'/users', "users",
		'/match', "match",
		'/chat', "chat"
		)
render = web.template.render('templates/')

usersList = {}

db = web.database(dbn='sqlite', db='users.db')
model = UserModel(db)

class index:
	def GET(self):
		return render.index()

class users:
	def POST(self):
		tmpUser = User(dict(web.input()))
		userid = db.insert('user', name=tmpUser.name, phoneNumber=tmpUser.phoneNumber, year=tmpUser.year, rating=tmpUser.rating, karma=tmpUser.karma, userID=tmpUser.userID)
		#usersList[userid] = tmpUser
		usersList[tmpUser.userID] = tmpUser
		'''usersListCopy = dict(usersList)
		f = open('userFile', 'w')
		returnList = []
		for user in usersListCopy.keys():
			user = usersListCopy[user].toJSON()
			returnList.append(str(user))
			f.write(str(user)+"\n")'''
	def GET(self):
		users = db.select('user')
		return users
		'''returnList = []
		f = open('userFile', 'r')
		for user in f:
			returnList.append(user[:-1])
		print returnList
		return returnList'''

class match:
	def POST(self):
		userID = web.input()["userID"]
		matchID = web.input()["matchID"]
		#user = db.select("users", where="userID="+userID)
		#match = db.select("users", where="userID="+matchID)
		usersList[userID].setMatch(matchID)
		usersList[matchID].setMatch(userID)
	def GET(self):
		userID = web.input()["userID"]
		user = usersList[userID]
		if "match" in user.attributes and user.attributes["match"] != None:
			return usersList[user.attributes["match"]].toJSON()
		return "None"

class chat:
	def POST(self):
		print web.input()
		userID = web.input()["userID"]
		matchID = web.input()["matchID"]
		message = web.input()["message"]
		usersList[matchID].addMessage(userID, message)
		print userID, matchID, message

	def GET(self):
		userID = web.input()["userID"]
		returnList = usersList[userID].messages[:]
		usersList[userID].messages = []
		print returnList
		return returnList


class User:
	def __init__(self, attributes):
		self.attributes = dict(attributes)
		self.messages = []

	def toJSON(self):
		jsonString = "{"
		for attribute in self.attributes:
			jsonString += "\"" + attribute + "\" : " + "\"" + self.attributes[attribute] + "\","
		jsonString = jsonString[:-1]
		jsonString += "}"
		return jsonString

	def setMatch(self, userID):
		self.attributes["match"] = userID

	def addMessage(self, matchID, message):
		self.messages.append(str(message))

if __name__ == "__main__": 
    app = web.application(urls, globals())
    app.run()        