################################################################################
################################################################################
### Chat webapp for Melt Studio
### Author: Juan Pablo Piedrahita Quintero
################################################################################
################################################################################

################################################################################
#### IMPORTS
################################################################################
from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api, reqparse
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit

from datetime import datetime

################################################################################
#### CONSTANTS
################################################################################


################################################################################
### GLOBALS
################################################################################
app = Flask(__name__)

################################################################################
### DB
################################################################################
DB_USER = 'root'
DB_PASSWORD = ''
DB_URL = 'localhost/chat_melt'

app.config['SQLALCHEMY_DATABASE_URI'] = ('mysql://' + DB_USER + ':' +
										DB_PASSWORD + '@' + DB_URL)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

#User model
class User(db.Model):
	__tablename__ = 'users'

	#first parameter is optional, if not given the name of the variable is used
	username = db.Column('username', db.String(16), primary_key=True)
	password = db.Column('password', db.String(45))
	online = db.Column('online', db.Integer)

	def __init__(self, username, password, online):
		self.username = username
		self.password = password
		self.online = online

#Message model
class Message(db.Model):
	__tablename__ = 'messages'

	id_message = db.Column('id_message', db.Integer, primary_key=True)
	message = db.Column('message', db.Text)
	username = db.Column('username', db.String(16), db.ForeignKey('users.username'))
	msg_time = db.Column('msg_time', db.DateTime, default=datetime.utcnow)

	def __init__(self, id_message, message, username, msg_time):
		self.id_message = id_message
		self.message = message
		self.username = username
		self.msg_time = msg_time

################################################################################
### API REST
################################################################################
CORS(app)
api = Api(app)

#add query arguments for the parser
parser = reqparse.RequestParser()

parser.add_argument('user')
parser.add_argument('pass')

#login
########### FALTA EMITIR LOGIN A SOCKETIO
class LogIn(Resource):
	def get(self):
		#gets the arguments
		args = parser.parse_args()
		curr_user = args['user']
		curr_pass = args['pass']

		#if one or both arguments are not given returns 400
		if (curr_user == None) or (curr_pass == None):
			res = {'message': 'Bad request'}

			return res, 400

		#gets the user
		user = User.query.filter_by(username=curr_user).first()

		#if the user doesnt exists returns 404
		if (user == None):
			res = {'message': 'Username not found'}

			return res, 404

		#checks the password
		login_ok = (user.password == curr_pass)

		#if the password is incorrect returns 401
		if not login_ok:
			res = {'message': 'Incorrect password'}

			return res, 401

		#if the password is correct
		else:
			#if the user is already online returns 409
			if (user.online):
				res = {'message': 'User already online'}

				return res, 409

			#if the user is not online sets him online and returns 200
			user.online = 1
			db.session.commit()

			res = {'message': 'Correct login',
				   'code': 200}

			return res, 200

#logout
########### FALTA EMITIR LOGIN A SOCKETIO
class LogOut(Resource):
	def get(self):
		#gets the arguments
		args = parser.parse_args()
		curr_user = args['user']

		#gets the user
		user = User.query.filter_by(username=curr_user).first()

		#if the user is not online returns 409
		if (not user.online):
			res = {'message': 'User is not online'}

			return res, 409

		#sets the user offline
		user.online = 0
		db.session.commit()

		res = {'message': 'Correct logout',
			   'code': 200}

		return res, 200

#create new user
class NewUser(Resource):
	def post(self):
		#gets the incoming data
		json = request.get_json(force=True)

		#sets the variables for the user creation
		username = json['username']
		password = json['password']
		online = 0

		#checks if the user already exists
		user = User.query.filter_by(username=username).first()
		if (user != None):
			res = {'msg': 'Username already exists'}

			return res, 409

		#inserts the user into the db
		user = User(username, password, online)
		db.session.add(user)
		db.session.commit()

		#returns response
		res = {'msg': 'New user created',
			   'code': 201}

		return res, 201

#get a user by username
class Users(Resource):
	def get(self):
		#gets the arguments
		args = parser.parse_args()
		curr_user = args['user']

		#gets the user by username
		user = User.query.filter_by(username=curr_user).first()

		#if the user does not exists returns 404
		if (user == None):
			res = {'username': None}

			return res, 404

		#if the user exists returns the username and 200
		res = {'username': user.username,
			   'code': 200}

		return res, 200

#gets all the logged in users
class LoggedInUsers(Resource):
	def get(self):
		users = User.query.filter(User.online != 0)

		#maps the query result to a list of dictionaries
		users_json = [{'username': user.username} for user in users]

		res = {'data': users_json,
			   'code': 200}

		return res, 200

#gets all the messages from the server
class AllMessages(Resource):
	def get(self):
		messages = Message.query.order_by(Message.msg_time).all()

		messages_json = [
			{
				'id_message': msg.id_message,
				'message': msg.message,
				'username': msg.username,
				'msg_time': msg.msg_time.strftime("%Y-%m-%d %H:%M:%S")
			}
			for msg in messages]

		res = {'data': messages_json,
			   'code': 200}

		return res, 200

#adds the resources
api.add_resource(LogIn, '/login')
api.add_resource(LogOut, '/logout')
api.add_resource(NewUser, '/newuser')
api.add_resource(Users, '/users')
api.add_resource(LoggedInUsers, '/logged')
api.add_resource(AllMessages, '/messages')

################################################################################
### SOCKET.IO
################################################################################
app.config['SECRET_KEY'] = 'mykey'

socketio = SocketIO(app)

@socketio.on('connect')
def handleConnect():
	print('user connected')

@socketio.on('disconnect')
def handleDisconnect():
	pass

@socketio.on('message-melt')
def handleMessage(msg):
	#inserts the message into the db
	message = Message(None, msg['message'], msg['username'], datetime.utcnow())
	db.session.add(message)
	db.session.commit()

	msg_json = {
		'id_message': message.id_message,
		'message': message.message,
		'username': message.username,
		'msg_time': message.msg_time.strftime("%Y-%m-%d %H:%M:%S")
	}

	print(msg_json)

	emit('message-melt', msg_json, broadcast=True)

@socketio.on('session-melt')
def handleLogIn(msg):
	msg = {
		'id_message': msg['id_message'],
		'message': msg['message'],
		'username': msg['username'],
		'msg_time': datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
	}

	print(msg)

	emit('session-melt', msg, broadcast=True)

################################################################################
### Main method
################################################################################
if __name__ == '__main__':
    #app.run()
    socketio.run(app)