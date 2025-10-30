// Простой мок для тестирования авторизации
import type { 
	LoginCredentials, 
	RegisterCredentials, 
	AuthResponse, 
	User 
} from '../types/auth.js';

/**
 * Создает простой мок JWT токен для тестирования
 */
function createMockJWT(user: User): string {
	const header = {
		alg: 'HS256',
		typ: 'JWT'
	};

	const payload = {
		email: user.email,
		role: user.role || 'admin',
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 часа
	};

	// Простое base64url кодирование для мока
	const encodeBase64Url = (obj: any) => {
		return btoa(JSON.stringify(obj))
			.replace(/=/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_');
	};

	const encodedHeader = encodeBase64Url(header);
	const encodedPayload = encodeBase64Url(payload);
	const signature = 'mock_signature'; // В реальности здесь была бы подпись

	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Мок-данные пользователей
const mockUsers: User[] = [
	{
		email: 'demo@okto.ru',
		role: 'superadmin',
	}
];

class MockAuthService {
	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		// Симуляция задержки сети
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		// Для демо: принимаем любой email/password
		if (credentials.email && credentials.password) {
			const user = mockUsers.find(u => u.email === credentials.email) || {
				id: '1',
				email: credentials.email,
				firstName: 'Demo',
				lastName: 'User',
				role: 'superadmin',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			
			return {
				user,
				token: createMockJWT(user),
				refreshToken: 'mock_refresh_token_' + Date.now(),
			};
		}
		
		throw new Error('Invalid credentials');
	}

	async register(credentials: RegisterCredentials): Promise<AuthResponse> {
		// Симуляция задержки сети
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		// Проверяем, что пользователь не существует
		const existingUser = mockUsers.find(u => u.email === credentials.email);
		if (existingUser) {
			throw new Error('User already exists');
		}
		
		const newUser: User = {
			email: credentials.email,
			role: 'admin', // По умолчанию администратор
		};
		
		mockUsers.push(newUser);
		
		return {
			user: newUser,
			token: createMockJWT(newUser),
			refreshToken: 'mock_refresh_token_' + Date.now(),
		};
	}

	async requestPasswordReset(email: string): Promise<{ message: string }> {
		// Симуляция задержки сети
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		return {
			message: 'Password reset link sent to your email'
		};
	}

	async logout(): Promise<void> {
		// Clear token from localStorage if stored there
		if (typeof window !== 'undefined') {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('refresh_token');
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

export const mockAuthService = new MockAuthService();
