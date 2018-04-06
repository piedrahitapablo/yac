import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as io from 'socket.io-client';

import { Message } from '../models/message'

import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';

import { GLOBAL } from '../services/global';

@Component({
	selector: 		'chat',
	templateUrl:	'../views/chat.html',
	providers:		[UserService, MessageService]
})

export class ChatComponent {
	public title: string;

	public username: string;
	public users: string[];
	public messages: Message[];

	public curr_message: string;

	private socket: SocketIOClient.Socket;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private _messageService: MessageService
	) {
		this.title = 'Chat';

		this.messages = [];
	}

	ngOnInit() {
		this.username = this.getCookie('username');

		if (this.username == '') {
			this._router.navigate(['/login']);
		}

		this.getOnlineUsers();
		this.getMessageHistory();

		this.socket = io(GLOBAL.url);

		this.socket.on('message-melt', (msg: Message) => {
			this.messages.push(msg);

			console.log(msg);
		});

		this.socket.on('session-melt', (msg: Message) => {
			this.messages.push(msg);

			console.log(msg);

			this.getOnlineUsers();
		});

		this.socket.on('connect', () => {
			//emits the log in event
			let msg = new Message(-1, this.username + ' connected', '', '');
			this.socket.emit('session-melt', msg);
		});

		this.socket.on('disconnect', () => {
			//emits the log out event
			let msg = new Message(-2, this.username + ' disconnected', '', '');
			this.socket.emit('session-melt', msg);
		});
	}

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

	logOut() {
		this._userService.logOut(this.username).subscribe(
			res => {
				let code = res.code;

				if (code == 200) {
					//emits the log out event
					let msg = new Message(-2, this.username + ' disconnected', '', '');
					this.socket.emit('session-melt', msg);

					this.socket.close();

					document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
					this._router.navigate(['/login']);
				}
			},
			error => {
				console.log(<any> error);
			}
			);
	}

	sendMessage() {
		let msg = new Message(0, this.curr_message, this.username, '');

		this.socket.emit('message-melt', msg);
		this.curr_message = '';
	}
}