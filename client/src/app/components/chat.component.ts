import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as io from 'socket.io-client';

import { Message } from '../models/message'

import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';
import { YoutubeService } from '../services/youtube.service';

import { DomSanitizer } from '@angular/platform-browser';

import { GLOBAL } from '../services/global';

@Component({
	selector: 		'chat',
	templateUrl:	'../views/chat.html',
	providers:		[UserService, MessageService, YoutubeService]
})

/*
* Chat component, uses SocketIO for real time chat
*/
export class ChatComponent {
	public title: string;

	//global variables
	public username: string;
	public users: string[];
	public messages: Message[];

	//2way data binding for the message form
	public curr_message: string;

	//SocketIO
	private socket: SocketIOClient.Socket;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private _messageService: MessageService,
		private _youtubeService: YoutubeService,
		private _sanitizer: DomSanitizer
	) {
		this.title = 'Chat';

		this.messages = [];
	}

	ngOnInit() {
		//gets the username from the cookies
		this.username = this.getCookie('username');

		//if the cookie does not exists redirects the user to the login page
		if (this.username == '') {
			this._router.navigate(['/login']);
		}

		//gets the current online users and the message history
		this.getOnlineUsers();
		this.getMessageHistory();

		//connects the socket
		this.socket = io(GLOBAL.url);

		//message-melt event, used for messages
		this.socket.on('message-melt', (msg: Message) => {
			//updates the global messages array
			this.messages.push(msg);
		});

		//session-melt event, used for session status
		this.socket.on('session-melt', (msg: Message) => {
			//updates the global messages array
			this.messages.push(msg);

			//updates the current online users
			this.getOnlineUsers();
		});

		//connection event
		this.socket.on('connect', () => {
			//emits the log in event
			let msg = new Message(-1, this.username + ' connected', '', '');
			this.socket.emit('session-melt', msg);
		});

		//disconnection event
		this.socket.on('disconnect', () => {
			//emits the log out event
			let msg = new Message(-2, this.username + ' disconnected', '', '');
			this.socket.emit('session-melt', msg);
		});
	}

	/*
	* function to get a cookie by name, returns an empty string if the cookie
	* does not exists
	*/
	getCookie(cname) {
		let name = cname + '=';
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');

		for(let i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}

		return '';
	}

	/*
	* function to get the online users from the db using the UserService, fills
	* the users array
	*/
	getOnlineUsers() {
		this._userService.getOnlineUsers().subscribe(
			res => {
				let code = res.code;

				if (code == 200) {
					this.users = res.data;
				}
			},
			error => {
				console.log(<any> error);
			}
		);
	}

	/*
	* function to get the message history from the db using the MessageService,
	* fills the messages array
	*/
	getMessageHistory() {
		this._messageService.getMessageHistory().subscribe(
			res => {
				let code = res.code;

				if (code == 200) {
					this.messages = res.data;
				}
			},
			error => {
				console.log(<any> error);
			}
		);
	}

	/*
	* function to perform the log out action, deletes the cookie and emits a
	* session-melt event using SocketIO
	*/
	logOut() {
		this._userService.logOut(this.username).subscribe(
			res => {
				let code = res.code;

				if (code == 200) {
					//emits the log out event
					let msg = new Message(-2, this.username + ' disconnected', '', '');
					this.socket.emit('session-melt', msg);

					//closes the SocketIO connection
					this.socket.close();

					//deletes the cookie
					document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

					//redirects the user to the login page
					this._router.navigate(['/login']);
				}
			},
			error => {
				console.log(<any> error);
			}
		);
	}

	/*
	* function to perform the send message action, emits a message-melt event
	*/
	sendMessage() {
		let msg: Message;
		//checks the message for youtube videos, the format is: /youtube song_name/artist
		let msg_info = this.checkYoutube(this.curr_message);
		console.log(msg_info);

		if (msg_info[0]) {
			//sets the song name and artist
			let videoQuery = msg_info[1] + '+' + msg_info[2];

			//changes all the spaces for +
			videoQuery.replace(/ /g, '+');

			//performs the GET request to get the first video id
			this._youtubeService.getVideo(videoQuery).subscribe(
				res => {
					//gets the first video id
					let id = res.items[0].id.videoId;
					msg = new Message(0, '/youtube: ' + id, this.username, '');

					//emits the message event
					this.socket.emit('message-melt', msg);
				},
				error => {
					console.log(<any> error);
				}
			);
		} else {
			msg = new Message(0, this.curr_message, this.username, '');

			//emits the message event
			this.socket.emit('message-melt', msg);
		}

		//clears the current message
		this.curr_message = '';
	}

	/*
	* function to check the message string for youtube videos using the format:
	* 		/youtube song_name/artist
	* returns an array with the following structure:
	*		[matches (boolean), songname, artist]
	*/
	checkYoutube(msg: string) {
		let reg_exp = /\/youtube (.*)\/(.*)$$/;

		let matches = reg_exp.test(msg);
		let info = [];
		if (matches) {
			info = reg_exp.exec(msg);
		} else {
			info = ['', '']
		}

		return [matches, info[1], info[2]];
	}

	/*
	* function to check the received messages for youtube ids
	*/
	checkReceivedMessage(msg: string) {
		let reg_exp = /^\/youtube: .*$/;

		return reg_exp.test(msg);
	}

	/*
	* gets a safe embed url for youtube videos
	*/
	getEmbedUrl(msg: string) {
		let reg_exp = /^\/youtube: (.*)$/;
		let id = reg_exp.exec(msg);

		let videoUrl = 'https://www.youtube.com/embed/' + id[1];
		let sanitizedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(videoUrl);

		return sanitizedUrl;
	}
}