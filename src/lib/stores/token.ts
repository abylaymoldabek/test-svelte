import { writable, derived } from 'svelte/store';
import { authService } from '../services/auth.js';

// Интерфейс для payload токена
export interface TokenPayload {
	user_id?: string;
	company_id?: string;
	email?: string;
	exp?: number;
	iat?: number;
	[key: string]: any;
}

// Store для payload токена
export const tokenPayload = writable<TokenPayload | null>(null);

// Store для статуса авторизации
export const isAuthenticated = derived(
	tokenPayload,
	($payload) => {
		const result = $payload !== null && !isTokenExpired($payload);
		return result;
	}
);

// Store для company_id
export const companyId = derived(
	tokenPayload,
	($payload) => $payload?.company_id || null
);

// Store для user_id
export const userId = derived(
	tokenPayload,
	($payload) => $payload?.user_id || null
);

// Функция для проверки истечения токена
function isTokenExpired(payload: TokenPayload | null): boolean {
	if (!payload?.exp) {
		return true;
	}
	const currentTime = Math.floor(Date.now() / 1000);
	const isExpired = payload.exp < currentTime;
	return isExpired;
}

// Функция для инициализации payload из localStorage
export function initializeTokenPayload() {
	if (typeof window !== 'undefined') {
		const payload = authService.getStoredPayload();
		if (payload && !isTokenExpired(payload)) {
			tokenPayload.set(payload);
		} else {
			// Токен истек или не существует, очищаем
			authService.logout();
			tokenPayload.set(null);
		}
		
		// Слушаем изменения в localStorage для автоматического обновления
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key === 'token_payload' || event.key === 'auth_token') {
				
				// Обновляем payload из localStorage
				const updatedPayload = authService.getStoredPayload();
				if (updatedPayload && !isTokenExpired(updatedPayload)) {
					tokenPayload.set(updatedPayload);
				} else {
					tokenPayload.set(null);
				}
			}
		};
		
		window.addEventListener('storage', handleStorageChange);
		
		// Возвращаем функцию для очистки слушателя
		return () => {
			window.removeEventListener('storage', handleStorageChange);
		};
	}
}

// Функция для обновления payload (вызывается после успешного логина)
export function updateTokenPayload(token?: string) {
	if (token) {
		const payload = authService.decodeJWT(token);
		tokenPayload.set(payload);
	} else {
		// Если токен не передан, берем его из localStorage
		const storedPayload = authService.getStoredPayload();
		tokenPayload.set(storedPayload);
	}
}

// Функция для принудительного обновления payload из localStorage
export function refreshTokenPayload() {
	const payload = authService.getStoredPayload();
	if (payload && !isTokenExpired(payload)) {
		tokenPayload.set(payload);
	} else {
		tokenPayload.set(null);
	}
}

// Функция для очистки payload (вызывается при logout)
export function clearTokenPayload() {
	tokenPayload.set(null);
}
