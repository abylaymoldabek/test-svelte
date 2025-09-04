import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { authService } from '../services/auth.js';
import type { User } from '../types/auth.js';

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isInitialized: boolean;
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	isInitialized: false
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		
		setUser: (user: User) => update(state => ({
			...state,
			user,
			isAuthenticated: true,
			isLoading: false
		})),
		
		setLoading: (loading: boolean) => update(state => ({
			...state,
			isLoading: loading
		})),
		
		logout: async () => {
			await authService.logout();
			set({ ...initialState, isInitialized: true });
		},
		
		reset: () => set(initialState),

		init: async () => {
			if (!browser) return;
			
			update(state => ({ ...state, isLoading: true }));
			
			const token = authService.getStoredToken();
			if (token) {
				try {
					const isValid = await authService.checkToken(token);
					if (isValid) {
						// Создаем временного пользователя на основе токена
						// В реальном приложении нужно получать данные пользователя с сервера
						const user: User = {
							id: '1',
							email: 'user@example.com',
							firstName: 'User',
							lastName: 'Admin',
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString()
						};
						
						update(state => ({
							...state,
							user,
							isAuthenticated: true,
							isLoading: false,
							isInitialized: true
						}));
					} else {
						// Токен недействителен, очищаем
						await authService.logout();
						update(state => ({
							...state,
							isLoading: false,
							isInitialized: true
						}));
					}
				} catch (error) {
					// Ошибка при проверке токена
					await authService.logout();
					update(state => ({
						...state,
						isLoading: false,
						isInitialized: true
					}));
				}
			} else {
				update(state => ({
					...state,
					isLoading: false,
					isInitialized: true
				}));
			}
		}
	};
}

export const authStore = createAuthStore();
