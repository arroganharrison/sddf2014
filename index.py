import web
import os

web.config.debug = True

urls = ('/', 'index',
		'/users', "users",
		'/match', "match",
		'/chat', "chat",
		'/login', "login"
		)
render = web.template.render('templates/')

usersList = {}
currentpath = os.path.abspath("./")
print currentpath

db = web.database(dbn='sqlite', db=currentpath+'/users')
#model = UserModel(db)

class index:
	def GET(self):
		return render.index()

class users:
	def POST(self):
		tmpUser = User(dict(web.input()))
		userid = db.insert('user', name=tmpUser.attributes["name"], password = tmpUser.attributes["password"], phoneNumber=tmpUser.attributes["phoneNumber"], year=tmpUser.attributes["year"], rating=tmpUser.attributes["rating"], karma=tmpUser.attributes["karma"], userID=tmpUser.attributes["userID"], picureURL=tmpUser.attributes["pictureURL"])
		#usersList[userid] = tmpUser
		usersList[tmpUser.attributes["userID"]] = tmpUser
		'''usersListCopy = dict(usersList)
		f = open('userFile', 'w')
		returnList = []
		for user in usersListCopy.keys():
			user = usersListCopy[user].toJSON()
			returnList.append(str(user))
			f.write(str(user)+"\n")'''
	def GET(self):
		users = db.select('user')
		returnList = []
		for user in users:
			print user
			returnList.append(str(User(dict(user)).toJSON()))
		print returnList
		return returnList
		'''returnList = []
		f = open('userFile', 'r')
		for user in f:
			returnList.append(user[:-1])
		print returnList
		return returnList'''

class match:
	def POST(self):
		# for item in usersList:
		# 	print item.attributes["userID"]
		userID = web.input()["userID"]
		matchID = web.input()["matchID"]
		print userID, matchID
		#user = db.select("users", where="userID="+userID)
		#match = db.select("users", where="userID="+matchID)
		usersList[userID].setMatch(matchID)
		usersList[matchID].setMatch(userID)
	def GET(self):
		userID = str(web.input()["userID"])
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

class login:
	def POST(self):

		username = web.input()["username"]
		password = web.input()["password"]
		checkUser = db.select('user', where="name="+"\""+username+"\"")
		if checkUser:
			for item in checkUser:
				print dict(item)
				tmpUser = User(dict(item))
				if tmpUser.attributes["password"] == password:
					usersList[tmpUser.attributes["userID"]] = tmpUser
					return tmpUser.attributes["userID"]
				else:
					return str("false")
		else:

			return str("new-user")
			


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