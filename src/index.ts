import { Hono } from 'hono';
import { Bindings } from './bindings';
import { bearerAuth } from 'hono/bearer-auth';
import { send } from './email';
import { activation } from './template';

const app = new Hono<{ Bindings: Bindings }>().basePath('/v1');

app.use(
	'/*',
	bearerAuth({
		verifyToken: async (token, c) => {
			return token === c.env.ACCESS_TOKEN;
		},
	})
);

app.post('/send', async (c) => {
	const body = await c.req.json();
	const resp = await send(c.env, body.to, body.name, body.title, body.content, body.type);
	return c.json({ success: resp.ok });
});

app.post('/send/activation', async (c) => {
	const body = await c.req.json();
	const resp = await send(
		c.env,
		body.to,
		body.name,
		`${body.title}`,
		activation(body.site_name, `${body.name}`, `${body.url}`)
	);
	return c.json({ success: resp.ok });
});

export default {
	fetch: app.fetch,
};
