import { Bindings } from "./bindings";

export async function send(
	env: Bindings,
	to: string,
	to_name: string,
	title: string,
	content: string,
	type: string = 'text/html'
) {
	const send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			personalizations: [
				{
					to: [{ email: `${to}`, name: `${to_name}` }],
					dkim_domain: `${env.DKIM_DOMAIN}`,
					dkim_selector: `${env.DKIM_SELECTOR}`,
					dkim_private_key: `${env.DKIM_PRIVATE_KEY}`
				},
			],
			from: { email: `${env.SENDER_EMAIL}`, name: `${env.SENDER_NAME}` },
			subject: `${title}`,
			content: [
				{
					type: `${type}`,
					value: `${content}`,
				},
			],
		}),
	});
	return await fetch(send_request);
}
