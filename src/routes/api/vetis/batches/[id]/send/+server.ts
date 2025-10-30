import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const VETIS_API_URL = 'http://158.160.90.93:8082';

export const POST: RequestHandler = async ({ params }: { params: any }) => {
  try {
    const { id } = params;

    const apiResponse = await fetch(`${VETIS_API_URL}/api/v1/batches/${id}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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