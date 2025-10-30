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
			
			// Получаем пользователя из JWT токена
			const user = authService.getUserFromToken();
			if (user) {
				// Токен валиден и пользователь получен
				update(state => ({
					...state,
					user,
					isAuthenticated: true,
					isLoading: false,
					isInitialized: true
				}));
			} else {
				// Токен отсутствует, истек или невалиден
				update(state => ({
					...state,
					user: null,
					isAuthenticated: false,
					isLoading: false,
					isInitialized: true
				}));
			}
		}
	};
}

export const authStore = createAuthStore();
