import { Bindings } from './bindings';
import { Resend } from 'resend';

export async function send(env: Bindings, to: string, title: string, content: string, type: string = 'text/html') {
	const resend = new Resend(env.RESEND_APIKEY);
	if ('text/html' === type) {
		const { data, error } = await resend.emails.send({
			from: `${env.SENDER_NAME} <${env.SENDER_EMAIL}>`,
			to: to,
			subject: title,
			html: content,
		});
		return Response.json({ data, error });
	} else if ('text/plain' === type) {
		const { data, error } = await resend.emails.send({
			from: `${env.SENDER_NAME} <${env.SENDER_EMAIL}>`,
			to: to,
			subject: title,
			text: content,
		});
		return Response.json({ data, error });
	} else {
		throw new Error(`type: ${type} not support!`);
	}
}
