import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
	name: 'youtubeEmbed'
})

export class YoutubePipe implements PipeTransform {
	constructor(
		private _sanitizer: DomSanitizer
	) {}

	/*
	* function to convert a string in the format:
	*		/youtube: videoID
	* into a youtube sanitized url
	*/
	transform(video: string) {
		let reg_exp = /^\/youtube: (.*)$/;
		let id = reg_exp.exec(video);

		let videoUrl = 'https://www.youtube.com/embed/' + id[1];
		let sanitizedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(videoUrl);

		return sanitizedUrl;
	}
}