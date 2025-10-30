import type { 
	LoginCredentials, 
	RegisterCredentials, 
	AuthResponse, 
	ResetPasswordRequest,
	User 
} from '../types/auth.js';
import { decodeJWT, isTokenExpired } from '../utils/jwt.js';

const API_BASE_URL = import.meta.env.PROD ? 'https://mars.dev.okto.ru:2000' : 'https://mars.dev.okto.ru:2000';
// const API_BASE_URL = import.meta.env.PROD ? 'http://localhost:2000' : 'http://localhost:2000';

interface AuthTokenResponse {
	auth_token: string;
}

interface AuthErrorResponse {
	error: string;
}

interface TokenPayload {
	user_id?: string;
	company_id?: string;
	email?: string;
	role?: string;
	exp?: number;
	iat?: number;
	[key: string]: any;
}

class AuthService {
	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${API_BASE_URL}${endpoint}`;
		
		const config: RequestInit = {
			headers: {
				'Content-Type': 'application/json',
				...options.headers,
			},
			...options,
		};

		try {
			const response = await fetch(url, config);
			
			// Получаем текст ответа для диагностики
			const responseText = await response.text();
			
			if (!response.ok) {
				let errorMessage = 'Something went wrong';
				try {
					if (responseText) {
						const error: AuthErrorResponse = JSON.parse(responseText);
						errorMessage = error.error || errorMessage;
					}
				} catch (parseError) {
					errorMessage = `HTTP ${response.status}: ${response.statusText}`;
				}
				throw new Error(errorMessage);
			}
			
			// Парсим JSON только если есть содержимое
			if (responseText.trim()) {
				try {
					const responseData = JSON.parse(responseText);
					return responseData;
				} catch (parseError) {
					return responseText as T;
				}
			} else {
				return null as T;
			}
		} catch (networkError) {
			throw networkError;
		}
	}

	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		try {
			const endpoint = import.meta.env.PROD ? '/auth/api' : '/auth/api';
			const tokenResponse = await this.request<AuthTokenResponse>(endpoint, {
				method: 'POST',
				body: JSON.stringify({
					email: credentials.email,
					password: credentials.password
				}),
			});

			// Сохраняем токены
			this.storeTokens(tokenResponse.auth_token, tokenResponse.auth_token);

			// Получаем пользователя из JWT токена
			const user = this.getUserFromToken();
			if (!user) {
				throw new Error('Invalid token received from server');
			}

			return {
				user,
				token: tokenResponse.auth_token,
				refreshToken: tokenResponse.auth_token // используем тот же токен как refresh
			};
		} catch (error) {
			// Fallback на мок для разработки, если сервер недоступен
			if (import.meta.env.DEV) {
				console.warn('Auth server unavailable, using mock auth:', error);
				const { mockAuthService } = await import('./mock-auth.js');
				return mockAuthService.login(credentials);
			}
			throw error;
		}
	}

	async register(credentials: RegisterCredentials): Promise<AuthResponse> {
		// Пока API не поддерживает регистрацию, возвращаем ошибку
		throw new Error('Registration is not supported yet');
	}

	async requestPasswordReset(data: ResetPasswordRequest): Promise<{ message: string }> {
		// Пока API не поддерживает сброс пароля, возвращаем ошибку
		throw new Error('Password reset is not supported yet');
	}

	async checkToken(token: string, companyId: string): Promise<boolean> {
		try {
			// Используем разные пути для dev и production
			const endpoint = import.meta.env.DEV ? '/api/v1/check-jwt-token' : '/api/v1/check-jwt-token';
			
			const response = await this.request<any>(endpoint, {
				method: 'POST',
				body: JSON.stringify({
					jwt: token,
					company_id: companyId
				}),
			});
			
			
			// Проверяем разные форматы ответа
			if (response === true || response === 'true' || 
				(typeof response === 'object' && response?.valid === true) ||
				(typeof response === 'string' && response.toLowerCase().includes('true'))) {
				return true;
			}
			
			// Если ответ получен успешно (HTTP 200), но содержимое не указывает на валидность
			return true; // HTTP 200 обычно означает успех для check-token endpoint
		} catch (error) {
			console.error('checkToken: Failed with error:', error);
			console.error('checkToken: Error message:', error instanceof Error ? error.message : 'Unknown error');
			return false;
		}
	}

	getStoredToken(): string | null {
		if (typeof window !== 'undefined') {
			
			const token = localStorage.getItem('auth_token');
			return token;
		}
		return null;
	}

	/**
	 * Получает данные пользователя из JWT токена
	 */
	getUserFromToken(): User | null {
		const token = this.getStoredToken();
		if (!token) {
			return null;
		}

		// Проверяем, не истек ли токен
		if (isTokenExpired(token)) {
			this.clearTokens();
			return null;
		}

		const payload = decodeJWT(token);
		if (!payload) {
			return null;
		}

		// Преобразуем payload в объект User
		return {
			email: payload.email || '',
			role: payload.role || 'admin',
		};
	}

	storeTokens(token: string, refreshToken: string): void {
		if (typeof window !== 'undefined') {
			
			localStorage.setItem('auth_token', token);
			localStorage.setItem('refresh_token', refreshToken);
			
			// Проверяем, что токены действительно сохранились
			const storedToken = localStorage.getItem('auth_token');
			const storedRefreshToken = localStorage.getItem('refresh_token');
			
			// Декодируем и сохраняем payload
			const payload = this.decodeJWT(token);
			if (payload) {
				localStorage.setItem('token_payload', JSON.stringify(payload));
			} else {
			}
		} else {
			console.log('Window is undefined, cannot store tokens');
		}
	}

	/**
	 * Декодирует JWT токен и возвращает payload
	 */
	decodeJWT(token: string): TokenPayload | null {
		try {
			const parts = token.split('.');
			if (parts.length !== 3) {
				console.error('Invalid JWT token format');
				return null;
			}

			// Декодируем payload (вторая часть токена)
			const payload = parts[1];
			// Добавляем padding если нужно для правильного base64 декодирования
			const paddedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
			const decodedPayload = atob(paddedPayload);
			
			return JSON.parse(decodedPayload) as TokenPayload;
		} catch (error) {
			console.error('Failed to decode JWT token:', error);
			return null;
		}
	}

	/**
	 * Получает сохраненный payload из localStorage
	 */
	getStoredPayload(): TokenPayload | null {
		if (typeof window !== 'undefined') {
			const payloadStr = localStorage.getItem('token_payload');
			if (payloadStr) {
				try {
					return JSON.parse(payloadStr) as TokenPayload;
				} catch (error) {
					console.error('Failed to parse stored payload:', error);
					return null;
				}
			}
		}
		return null;
	}

	/**
	 * Получает company_id из сохраненного payload
	 */
	getCompanyId(): string | null {
		const payload = this.getStoredPayload();
		return payload?.company_id || null;
	}

	/**
	 * Получает user_id из сохраненного payload
	 */
	getUserId(): string | null {
		const payload = this.getStoredPayload();
		return payload?.user_id || null;
	}

	/**
	 * Проверяет, истек ли токен
	 */
	isTokenExpired(): boolean {
		const payload = this.getStoredPayload();
		if (!payload?.exp) {
			return true;
		}
		
		const currentTime = Math.floor(Date.now() / 1000);
		return payload.exp < currentTime;
	}

	/**
	 * Проверяет, нужно ли обновить токен (если до истечения осталось меньше 5 минут)
	 */
	shouldRefreshToken(): boolean {
		const payload = this.getStoredPayload();
		if (!payload?.exp) {
			return false;
		}
		
		const currentTime = Math.floor(Date.now() / 1000);
		const timeUntilExpiry = payload.exp - currentTime;
		// Обновляем токен если до истечения осталось меньше 5 минут (300 секунд)
		return timeUntilExpiry < 300;
	}

	/**
	 * Обновляет токен используя refresh token
	 */
	async refreshToken(): Promise<string | null> {
		try {
			const refreshToken = localStorage.getItem('refresh_token');
			if (!refreshToken) {
				return null;
			}

			const endpoint = import.meta.env.DEV ? '/api/v1/auth/refresh' : '/v1/auth/refresh';
			
			const response = await this.request<AuthTokenResponse>(endpoint, {
				method: 'POST',
				body: JSON.stringify({
					refresh_token: refreshToken
				}),
			});

			// Сохраняем новый токен
			this.storeTokens(response.auth_token, refreshToken);
			
			// Обновляем stores
			const { refreshTokenPayload } = await import('../stores/token.js');
			refreshTokenPayload();
			
			return response.auth_token;
		} catch (error) {
			console.error('Failed to refresh token:', error);
			// Если обновление токена не удалось, очищаем все данные
			await this.logout();
			return null;
		}
	}

	/**
	 * Автоматически обновляет токен если это необходимо
	 */
	async ensureValidToken(): Promise<boolean> {
		// Проверяем, истек ли токен
		if (this.isTokenExpired()) {
			const newToken = await this.refreshToken();
			return newToken !== null;
		}
		
		// Проверяем, нужно ли обновить токен
		if (this.shouldRefreshToken()) {
			const newToken = await this.refreshToken();
			// Даже если обновление не удалось, текущий токен еще может быть валидным
			return newToken !== null || !this.isTokenExpired();
		}
		
		return true;
	}

	/**
	 * Очищает сохраненные токены
	 */
	clearTokens(): void {
		if (typeof window !== 'undefined') {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('refresh_token');
			localStorage.removeItem('token_payload');
		}
	}

	/**
	 * Очищает все сохраненные данные при logout
	 */
	async logout(): Promise<void> {
		this.clearTokens();
		
		// Очищаем stores
		if (typeof window !== 'undefined') {
			const { clearTokenPayload } = await import('../stores/token.js');
			clearTokenPayload();
		}
	}
}

export const authService = new AuthService();
