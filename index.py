import web
import os

web.config.debug = True

'''
urls is a variable that holds all the url mapping
'''

urls = ('/', 'index',
		'/users', "users",
		'/match', "match",
		'/chat', "chat",
		'/login', "login",
		'/rating', "rating"
		)

'''
declare the file to use as html template
'''

render = web.template.render('templates/')

usersList = {}
currentpath = os.path.abspath("./")
print currentpath

db = web.database(dbn='sqlite', db=currentpath+'/users')
#model = UserModel(db)
'''
these classes correspond to urls that the UI requests
each handles a specific case, e.g. users is for creating users and requesting users from the database
'''

class index:
	def GET(self):
		return render.index()

class users:
	'''
	handle a user creation request from frontend, creates user in database and adds user to user Dictionary
	'''

	def POST(self):
		tmpUser = User(dict(web.input()))
		userid = db.insert('user', name=tmpUser.attributes["name"], password = tmpUser.attributes["password"], phoneNumber=tmpUser.attributes["phoneNumber"], year=tmpUser.attributes["year"], rating=tmpUser.attributes["rating"], karma=tmpUser.attributes["karma"], userID=tmpUser.attributes["userID"], picureURL=tmpUser.attributes["picureURL"])
		#usersList[userid] = tmpUser
		usersList[tmpUser.attributes["userID"]] = tmpUser

	'''
	returns JSON array of users in the database
	'''

	def GET(self):
		users = db.select('user')
		returnList = []
		for user in users:
			print user
			returnList.append(str(User(dict(user)).toJSON()))
		print returnList
		return returnList

class match:

	'''
	handle a match request, initiates matching with another user
	'''

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

	'''
	handle GET requests to see if a waiting user has a match yet
	'''

	def GET(self):
		userID = str(web.input()["userID"])
		user = usersList[userID]
		if "match" in user.attributes and user.attributes["match"] != None:
			return usersList[user.attributes["match"]].toJSON()
		return "None"

class chat:

	'''
	posts a message to a user
	'''

	def POST(self):
		print web.input()
		userID = web.input()["userID"]
		matchID = web.input()["matchID"]
		message = web.input()["message"]
		usersList[matchID].addMessage(userID, message)
		print userID, matchID, message

	'''
	handle GET requests to see if a waiting user has a chat message yet
	'''

	def GET(self):
		userID = web.input()["userID"]
		returnList = usersList[userID].messages[:]
		usersList[userID].messages = []
		print returnList
		return returnList

class login:

	'''
	logs in existing users or begins process to create new users
	'''

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
			
class rating:

	'''
	updates rating for a user
	'''

	def POST(self):
		rating = int(web.input()["rating"])
		userID = web.input()["userID"]
		# checkUser = db.select('user', where="userID="+"\""+userID+"\"")
		# if checkUser:
		# 	for item in checkUser:
		# 		tmpUser = User(dict(item))
		db.update('user', where="userID="+"\""+userID+"\"", rating=rating)

				

'''
This class is used to represent users in the backend
all attributes of the user are stored in a Dictionary "Attributes"
messages are stored in a List "messages"
'''

class User:
	def __init__(self, attributes):
		self.attributes = dict(attributes)
		self.messages = []

	'''
	converts the user attributes to JSON for transport to frontend UI
	'''
	
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