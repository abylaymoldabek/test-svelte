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
			const user = authService.getStoredPayload();
			if (token && user) {
				try {
					const isValid = await authService.checkToken(token, user.company_id || '');
					if (isValid) {
						// Токен действителен, получаем данные пользователя
						update(state => ({
							...state,
							company_id: user?.company_id || null,
							email: user?.email || null,
							isAuthenticated: true,
							isLoading: false,
							isInitialized: true
						}));
					} else {
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
