import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { Message } from '../models/message';
import { GLOBAL } from './global';

@Injectable()

export class MessageService {
	public url: string;

	private _ALL_MESSAGES: string;

	constructor(
		public _http: Http
	) {
		this.url = GLOBAL.url;

		this._ALL_MESSAGES = 'messages';
	}

	getMessageHistory() {
		let getUrl = this.url + this._ALL_MESSAGES;

		return this._http.get(getUrl).map(res => res.json());
	}
}