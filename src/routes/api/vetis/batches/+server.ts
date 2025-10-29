import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const VETIS_API_URL = env.VETIS_API_URL || 'http://localhost:8082';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const requestBody = await request.json();

    const apiResponse = await fetch(VETIS_API_URL + '/api/v1/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return new Response(errorText, { status: apiResponse.status });
    }

    const data = await apiResponse.json();
    return json(data);
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
};
