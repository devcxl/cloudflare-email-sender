export async function send(
	from: string,
	from_name: string,
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
				},
			],
			from: { email: `${from}`, name: `${from_name}` },
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
