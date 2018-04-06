import { Component } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from '../models/user';

import { UserService } from '../services/user.service';

@Component({
	selector: 		'newUser',
	templateUrl:	'../views/new_user.html',
	providers:		[UserService]
})

export class NewUserComponent {
	public title: string;

	public username: string;
	public password: string;
	public password2: string;

	public userExists: boolean;
	public passwordsDoNotMatch: boolean;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService
	) {
		this.title = 'Create new user';

		this.userExists = false;
		this.passwordsDoNotMatch = false;
	}

	onSubmit() {
		this.userExists = false;
		this.passwordsDoNotMatch = false;

		if (this.password != this.password2) {
			this.passwordsDoNotMatch = true;
			return;
		}

		let user = new User(this.username, this.password, 0);

		this.newUser(user);
	}

	newUser(user: User) {
		this._userService.newUser(user).subscribe(
			res => {
				let code = res.code;

				console.log(res);

				if (code == 201) {
					this._router.navigate(['/login']);
				}
			},
			error => {
				console.log(<any> error);

				let code = error.status;

				if (code == 409) {
					this.userExists = true;
				}
			}
		);
	}
}