import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { tokenPayload, isAuthenticated } from '$lib/stores/token.js';
import { authService } from '$lib/services/auth.js';

/**
 * Проверяет валидность токена и перенаправляет на страницу входа при необходимости
 * @param redirectTo - путь для перенаправления после успешной авторизации (опционально)
 * @returns true если пользователь авторизован, false если был выполнен редирект
 */
export async function checkAuthAndRedirect(redirectTo?: string): Promise<boolean> {
	const isAuth = get(isAuthenticated);
	const payload = get(tokenPayload);
	
	console.log('checkAuthAndRedirect called:', { isAuth, payload, redirectTo });
	
	// Пытаемся обновить токен если необходимо
	const tokenValid = await authService.ensureValidToken();
	
	if (!tokenValid) {
		console.log('Token invalid and cannot be refreshed, redirecting to login');
		// Если токен нельзя обновить, очищаем localStorage и перенаправляем
		authService.logout();
		
		// Формируем URL для редиректа
		const loginUrl = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
		console.log('Redirecting to:', loginUrl);
		goto(loginUrl);
		
		return false;
	}
	
	// Проверяем, есть ли действующий токен в stores
	if (!isAuth || !payload) {
		// Токен может быть обновлен, но stores еще не обновились
		// Даем время на обновление stores
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const updatedIsAuth = get(isAuthenticated);
		const updatedPayload = get(tokenPayload);
		
		if (!updatedIsAuth || !updatedPayload) {
			console.log('Stores not updated after token refresh, redirecting to login');
			authService.logout();
			
			const loginUrl = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
			console.log('Redirecting to:', loginUrl);
			goto(loginUrl);
			
			return false;
		}
	}
	
	console.log('User is authenticated, staying on page');
	return true;
}

/**
 * Проверяет истечение токена
 * @param payload - payload токена
 * @returns true если токен истек
 */
export function isTokenExpired(payload: any): boolean {
	if (!payload?.exp) {
		console.log('Token has no expiration field');
		return true;
	}
	
	const currentTime = Math.floor(Date.now() / 1000);
	const isExpired = payload.exp < currentTime;
		
	return isExpired;
}

/**
 * Автоматически проверяет токен каждые 1 минуту и обновляет при необходимости
 * @param currentPath - текущий путь страницы
 */
export function startTokenWatcher(currentPath: string) {
	const interval = setInterval(async () => {
		console.log('Token watcher: checking token validity...');
		
		// Пытаемся обновить токен если необходимо
		const tokenValid = await authService.ensureValidToken();
		
		if (!tokenValid) {
			console.log('Token watcher: token invalid, clearing interval and redirecting');
			clearInterval(interval);
			await checkAuthAndRedirect(currentPath);
		} else {
			console.log('Token watcher: token is valid');
		}
	}, 60 * 1000); // Проверяем каждую минуту
	
	// Возвращаем функцию для очистки интервала
	return () => clearInterval(interval);
}

/**
 * Хук для использования в компонентах Svelte
 * Автоматически проверяет авторизацию при монтировании компонента
 * @param currentPath - текущий путь страницы
 * @returns объект с функциями управления авторизацией
 */
export function useAuthGuard(currentPath: string) {
	let cleanupWatcher: (() => void) | null = null;
	
	// Асинхронная проверка авторизации
	const checkAuth = async () => {
		const payload = get(tokenPayload);
		const isAuth = get(isAuthenticated);
		
		// Если stores еще не инициализированы (null), ждем
		if (payload === null && typeof window !== 'undefined') {
			// Проверяем localStorage напрямую
			const token = localStorage.getItem('auth_token');
			if (!token) {
				// Токена нет, перенаправляем
				await checkAuthAndRedirect(currentPath);
				return false;
			}
			// Токен есть, даем время stores инициализироваться
			setTimeout(() => checkAuth(), 50);
			return true;
		}
		
		// Проверяем и обновляем токен если необходимо
		const tokenValid = await authService.ensureValidToken();
		
		if (!tokenValid || !isAuth || !payload) {
			await checkAuthAndRedirect(currentPath);
			return false;
		}
		
		// Запускаем наблюдатель если еще не запущен
		if (!cleanupWatcher) {
			cleanupWatcher = startTokenWatcher(currentPath);
		}
		
		return true;
	};
	
	// Запускаем асинхронную проверку
	let isAuthorized = false;
	checkAuth().then(result => {
		isAuthorized = result;
	});
	
	return {
		isAuthorized,
		cleanup: () => {
			if (cleanupWatcher) {
				cleanupWatcher();
			}
		},
		checkAuth: () => checkAuthAndRedirect(currentPath)
	};
}
