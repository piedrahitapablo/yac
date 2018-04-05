import { Component } from '@angular/core'

@Component({
	selector: 		'newUser',
	templateUrl:	'../views/new_user.html'
})

export class NewUserComponent {
	public title: string;

	public username: string;
	public password: string;
	public password2: string;

	constructor() {
		this.title = 'Create new user'
	}
}