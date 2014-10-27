import web

web.config.debug = True

urls = ('/', 'index',
		'/users', "users",
		'/match', "match"
		)
render = web.template.render('templates/')

usersList = []

class index:
	def GET(self):
		return render.index()

class users:
	def POST(self):
		usersList.append(User(dict(web.input())))
		usersListCopy = usersList[:]
		f = open('userFile', 'w')
		returnList = []
		for user in usersListCopy:
			user = user.toJSON()
			returnList.append(str(user))
			f.write(str(user)+"\n")
	def GET(self):
		returnList = []
		f = open('userFile', 'r')
		for user in f:
			returnList.append(user[:-1])
		# for user in usersList:
		# 	returnList.append(str(user.toJSON()))
		print returnList
		return returnList

class match:
	def POST(self):
		userID = web.input()["userID"]
		matchID = web.input()["matchID"]
		for user in usersList:
			if userID == user.attributes["userID"]:
				user.match(matchID)
			elif matchID == user.attributes["userID"]:
				user.match(userID)
	def GET(self):
		userID = web.input()["userID"]
		for user in usersList:
			if userID == user.attributes["userID"] and "match" in user.attributes and user.attributes["match"] != None:
				for match in usersList:
					if match.attributes["userID"] == user.attributes["match"]:
						return match.toJSON()
		return "None"


class User:
	def __init__(self, attributes):
		self.attributes = dict(attributes)

	def toJSON(self):
		jsonString = "{"
		for attribute in self.attributes:
			jsonString += "\"" + attribute + "\" : " + "\"" + self.attributes[attribute] + "\","
		jsonString = jsonString[:-1]
		jsonString += "}"
		return jsonString

	def match(self, matchID):
		for user in usersList:
			if matchID == user.attributes["userID"]:
				self.setMatch(user.attributes["userID"])

	def setMatch(self, userID):
		self.attributes["match"] = userID;

if __name__ == "__main__": 
    app = web.application(urls, globals())
    app.run()        