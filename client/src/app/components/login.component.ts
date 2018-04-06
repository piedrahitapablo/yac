import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from '../models/user';

import { UserService } from '../services/user.service';

@Component({
	selector: 		'login',
	templateUrl:	'../views/login.html',
	providers:		[UserService]
})

/*
* Log in component
*/
export class LogInComponent {
	public title: string;

	//2way data binding
	public username: string;
	public password: string;

	//booleans to display error messages in the component view
	public notFound: boolean;
	public incorrectPassword: boolean;
	public alreadyOnline: boolean;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService
	) {
		this.title = 'Login'

		//sets the errors to false
		this.notFound = false;
		this.incorrectPassword = false;
		this.alreadyOnline = false;
	}

	/*
	* function to perform the form submission
	*/
	onSubmit() {
		//sets the errors to false
		this.notFound = false;
		this.incorrectPassword = false;
		this.alreadyOnline = false;

		//creates a user object with the user inputs
		let user = new User(this.username, this.password, 0);

		//attempts the log in
		this.logIn(user);
	}

	/*
	* function to perform the log in action, if the log in is successful creates
	* a cookie and redirects the user to the chat page
	*/
	logIn(user: User) {
		this._userService.logIn(user).subscribe(
			res => {
				console.log(res);
				let code = res.code;

				if (code == 200) {
					//creates the cookie
					document.cookie = 'username=' + user.username;

					//redirects the user to the chat page
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