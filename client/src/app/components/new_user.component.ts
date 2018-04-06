import { Component } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from '../models/user';

import { UserService } from '../services/user.service';

@Component({
	selector: 		'newUser',
	templateUrl:	'../views/new_user.html',
	providers:		[UserService]
})

/*
* New user component
*/
export class NewUserComponent {
	public title: string;

	//2way data binding
	public username: string;
	public password: string;
	public password2: string;

	//booleans to display error messages in the component view
	public userExists: boolean;
	public passwordsDoNotMatch: boolean;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService
	) {
		this.title = 'Create new user';

		//sets the errors to false
		this.userExists = false;
		this.passwordsDoNotMatch = false;
	}

	/*
	* function to perform the form submission
	*/
	onSubmit() {
		//sets the errors to false
		this.userExists = false;
		this.passwordsDoNotMatch = false;

		//if the passwords do not match sets the error and ends the function
		if (this.password != this.password2) {
			this.passwordsDoNotMatch = true;
			return;
		}

		//creates a user object using the user inputs
		let user = new User(this.username, this.password, 0);

		//attempts to create a new user
		this.newUser(user);
	}

	/*
	* function to perform the user creation, if the creation is successful
	* redirects the user to the login page. If the entered username is already
	* in use sets the error
	*/
	newUser(user: User) {
		this._userService.newUser(user).subscribe(
			res => {
				let code = res.code;

				console.log(res);

				if (code == 201) {
					//redirects the user to the login page
					this._router.navigate(['/login']);
				}
			},
			error => {
				console.log(<any> error);

				let code = error.status;

				if (code == 409) {
					//sets the error
					this.userExists = true;
				}
			}
		);
	}
}