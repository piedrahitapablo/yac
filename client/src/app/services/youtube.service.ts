import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { GLOBAL } from './global';

@Injectable()

/*
* Youtube service
*/
export class YoutubeService {
	public url: string;
	public apiKey: string;

	//global constants
	private _SEARCH_VIDEO: string[];

	constructor(
		public _http: Http
	) {
		this.url = GLOBAL.youtubeUrl;
		this.apiKey = GLOBAL.googleAPIKey;

		this._SEARCH_VIDEO = ['search?part=snippet&q=',
							  '&type=video&key=' + this.apiKey];
	}

	/*
	* function to search a video using a string query
	*/
	getVideo(searchQuery: string) {
		let getUrl = this.url + this._SEARCH_VIDEO[0]
					 + searchQuery + this._SEARCH_VIDEO[1];

		return this._http.get(getUrl).map(res => res.json());
	}
}