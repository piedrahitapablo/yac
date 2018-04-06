import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from '../models/user';

import { UserService } from '../services/user.service';

@Component({
	selector: 		'login',
	templateUrl:	'../views/login.html',
	providers:		[UserService]
})

export class LogInComponent {
	public title: string;

	public username: string;
	public password: string;

	public notFound: boolean;
	public incorrectPassword: boolean;
	public alreadyOnline: boolean;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService
	) {
		this.title = 'Login'

		this.notFound = false;
		this.incorrectPassword = false;
		this.alreadyOnline = false;
	}

	onSubmit() {
		this.notFound = false;
		this.incorrectPassword = false;
		this.alreadyOnline = false;

		let user = new User(this.username, this.password, 0);

		this.logIn(user);
	}

	logIn(user: User) {
		this._userService.logIn(user).subscribe(
			res => {
				console.log(res);
				let code = res.code;

				if (code == 200) {
					document.cookie = 'username=' + user.username;
					this._router.navigate(['/chat']);
				}
			},
			error => {
				console.log(<any> error);

				let code = error.status;

				if (code == 404) {
					this.notFound = true;
				} else if (code == 401) {
					this.incorrectPassword = true;
				} else if (code == 409) {
					this.alreadyOnline = true;
				}
			}
		);
	}
}