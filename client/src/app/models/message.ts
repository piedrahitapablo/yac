/*
* Message model
*/
export class Message {
	constructor(
		public id_message: number,
		public message: string,
		public username: string,
		public msg_time: string
	) {}
}