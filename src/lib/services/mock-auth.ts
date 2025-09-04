// Простой мок для тестирования авторизации
import type { 
	LoginCredentials, 
	RegisterCredentials, 
	AuthResponse, 
	User 
} from '../types/auth.js';

// Мок-данные пользователей
const mockUsers: User[] = [
	{
		id: '1',
		email: 'demo@okto.ru',
		firstName: 'Demo',
		lastName: 'User',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
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
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			
			return {
				user,
				token: 'mock_jwt_token_' + Date.now(),
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
			id: Date.now().toString(),
			email: credentials.email,
			firstName: credentials.firstName,
			lastName: credentials.lastName,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		
		mockUsers.push(newUser);
		
		return {
			user: newUser,
			token: 'mock_jwt_token_' + Date.now(),
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
