import type { 
	LoginCredentials, 
	RegisterCredentials, 
	AuthResponse, 
	ResetPasswordRequest 
} from '../types/auth.js';

const API_BASE_URL = 'https://mars.dev.okto.ru:2000/v1'; // Auth service endpoint

interface AuthTokenResponse {
	auth_token: string;
}

interface AuthErrorResponse {
	error: string;
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

		const response = await fetch(url, config);
		
		if (!response.ok) {
			let errorMessage = 'Something went wrong';
			try {
				const error: AuthErrorResponse = await response.json();
				errorMessage = error.error || errorMessage;
			} catch {
				errorMessage = `HTTP ${response.status}: ${response.statusText}`;
			}
			throw new Error(errorMessage);
		}
		
		return response.json();
	}

	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		// Используем API /auth/get-token для получения токена
		const tokenResponse = await this.request<AuthTokenResponse>('/auth/get-token', {
			method: 'POST',
			body: JSON.stringify({
				email: credentials.email,
				password: credentials.password
			}),
		});

		// Создаем mock user object, так как API не возвращает user данные
		const user = {
			id: '1', // temp id
			email: credentials.email,
			firstName: 'User', // temp name
			lastName: 'Admin', // temp lastname
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		return {
			user,
			token: tokenResponse.auth_token,
			refreshToken: tokenResponse.auth_token // используем тот же токен как refresh
		};
	}

	async register(credentials: RegisterCredentials): Promise<AuthResponse> {
		// Пока API не поддерживает регистрацию, возвращаем ошибку
		throw new Error('Registration is not supported yet');
	}

	async requestPasswordReset(data: ResetPasswordRequest): Promise<{ message: string }> {
		// Пока API не поддерживает сброс пароля, возвращаем ошибку
		throw new Error('Password reset is not supported yet');
	}

	async logout(): Promise<void> {
		// Clear token from localStorage if stored there
		if (typeof window !== 'undefined') {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('refresh_token');
		}
	}

	async checkToken(token: string): Promise<boolean> {
		try {
			// Используем API /auth/check-jwt-token для проверки токена
			await this.request('/auth/check-jwt-token', {
				method: 'POST',
				body: JSON.stringify({
					jwt: token,
					company_id: '3ac61c5d-249d-43f5-a773-7561faf54b2d' // временный company_id
				}),
			});
			return true;
		} catch {
			return false;
		}
	}

	getStoredToken(): string | null {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('auth_token');
		}
		return null;
	}

	storeTokens(token: string, refreshToken: string): void {
		if (typeof window !== 'undefined') {
			localStorage.setItem('auth_token', token);
			localStorage.setItem('refresh_token', refreshToken);
		}
	}
}

export const authService = new AuthService();
