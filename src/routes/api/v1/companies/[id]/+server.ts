import type { RequestHandler } from '@sveltejs/kit';

const API_BASE_URL = 'http://158.160.90.93:8082';

export const GET: RequestHandler = async ({ params, request }) => {
	const companyId = params.id;
	const apiUrl = `${API_BASE_URL}/api/v1/companies/${companyId}`;

	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				// Пробрасываем Authorization header если есть
				...(request.headers.get('authorization') && {
					'Authorization': request.headers.get('authorization')!
				})
			}
		});

		if (!response.ok) {
			return new Response(JSON.stringify({ error: `Backend returned ${response.status}` }), {
				status: response.status,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const data = await response.json();
		
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('API proxy error:', error);
		return new Response(JSON.stringify({ error: 'Failed to connect to backend' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const companyId = params.id;
	const apiUrl = `${API_BASE_URL}/api/v1/companies/${companyId}`;

	try {
		const body = await request.text();
		
		const response = await fetch(apiUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				// Пробрасываем Authorization header если есть
				...(request.headers.get('authorization') && {
					'Authorization': request.headers.get('authorization')!
				})
			},
			body
		});

		if (!response.ok) {
			return new Response(JSON.stringify({ error: `Backend returned ${response.status}` }), {
				status: response.status,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const data = await response.json();
		
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('API proxy error:', error);
		return new Response(JSON.stringify({ error: 'Failed to connect to backend' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};