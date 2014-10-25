import web

web.config.debug = True

urls = ('/', 'index',
		'/users', "users"
		)
render = web.template.render('templates/')

class index:
	def GET(self):
		return render.index()

class users:
	usersList = []
	def POST(self):
		#print dict(web.input())
		self.usersList.append(User(dict(web.input())))
		#print self.usersList
	def GET(self):
		usersList = self.usersList[:]
		returnList = []
		for user in usersList:
			user = user.toJSON()
			returnList.append(str(user))
			print user
		print returnList
		return returnList
		#return returnList

	#def toJSON(self):

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

if __name__ == "__main__": 
    app = web.application(urls, globals())
    app.run()        