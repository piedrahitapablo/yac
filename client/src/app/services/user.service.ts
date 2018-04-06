import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { User } from '../models/user';
import { GLOBAL } from './global';

@Injectable()

/*
* User service
*/
export class UserService {
	public url: string;

	//global constants
	private _LOGIN: string[];
	private _LOGOUT: string;
	private _NEW_USER: string;
	private _LOGGED_IN_USERS: string;

	constructor(
		public _http: Http
	) {
		this.url = GLOBAL.url;

		this._LOGIN = ['login?user=', '&pass='];
		this._LOGOUT = 'logout?user=';
		this._NEW_USER = 'newuser';
		this._LOGGED_IN_USERS = 'logged';
	}

	/*
	* function to perform the log in action
	*/
	logIn(user: User) {
		let getUrl = this.url + this._LOGIN[0] + user.username
			+ this._LOGIN[1] + user.password;

		return this._http.get(getUrl).map(res => res.json());
	}

	/*
	* function to perform the log out action
	*/
	logOut(username: string) {
		let getUrl = this.url + this._LOGOUT + username;

		return this._http.get(getUrl).map(res => res.json());
	}

	/*
	* function to perform the user creation
	*/
	newUser(user: User) {
		let json = JSON.stringify(user);
		let headers = new Headers({'Content-Type':'application/json'});

		let postUrl = this.url + this._NEW_USER;

		return this._http.post(postUrl, json, {headers: headers}).map(res => res.json())
	}

	/*
	* function to get the current online users
	*/
	getOnlineUsers() {
		let getUrl = this.url + this._LOGGED_IN_USERS;

		return this._http.get(getUrl).map(res => res.json());
	}
}