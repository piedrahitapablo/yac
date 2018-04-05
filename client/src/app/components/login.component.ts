import { Component } from '@angular/core'

@Component({
	selector: 		'login',
	templateUrl:	'../views/login.html'
})

export class LoginComponent {
	public title: string;

	public username: string;
	public password: string;

	constructor() {
		this.title = 'Login'
	}
}