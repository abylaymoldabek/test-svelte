import { authService } from '../services/auth.js';
import { refreshTokenPayload } from '../stores/token.js';

/**
 * HTTP клиент с автоматическим обновлением токенов
 */
class HttpClient {
	private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
		// Проверяем и обновляем токен перед запросом
		const tokenValid = await authService.ensureValidToken();
		
		if (!tokenValid) {
			throw new Error('Authentication required');
		}
		
		// Получаем текущий токен
		const token = authService.getStoredToken();
		
		// Добавляем заголовок авторизации
		const headers = {
			'Content-Type': 'application/json',
			...(token && { 'Authorization': `Bearer ${token}` }),
			...options.headers,
		};
		
		const config: RequestInit = {
			...options,
			headers,
		};
		
		const response = await fetch(url, config);
		
		// Если получили 401, пытаемся обновить токен
		if (response.status === 401) {
			
			const newToken = await authService.refreshToken();
			if (newToken) {
				// Повторяем запрос с новым токеном
				const newHeaders = {
					...headers,
					'Authorization': `Bearer ${newToken}`,
				};
				
				const retryResponse = await fetch(url, {
					...config,
					headers: newHeaders,
				});
				
				if (!retryResponse.ok) {
					throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
				}
				
				return retryResponse.json();
			} else {
				throw new Error('Authentication failed');
			}
		}
		
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		
		return response.json();
	}
	
	async get<T>(url: string, options?: RequestInit): Promise<T> {
		return this.makeRequest<T>(url, { ...options, method: 'GET' });
	}
	
	async post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
		return this.makeRequest<T>(url, {
			...options,
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		});
	}
	
	async put<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
		return this.makeRequest<T>(url, {
			...options,
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
		});
	}
	
	async delete<T>(url: string, options?: RequestInit): Promise<T> {
		return this.makeRequest<T>(url, { ...options, method: 'DELETE' });
	}
	
	async patch<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
		return this.makeRequest<T>(url, {
			...options,
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined,
		});
	}
}

export const httpClient = new HttpClient();
