/**
 * Утилиты для работы с JWT токенами
 */

export interface JWTPayload {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	iat?: number;
	exp?: number;
	[key: string]: any;
}

/**
 * Декодирует JWT токен и возвращает payload
 * Внимание: это только декодирование, без проверки подписи!
 */
export function decodeJWT(token: string): JWTPayload | null {
	try {
		// JWT состоит из трех частей, разделенных точками
		const parts = token.split('.');
		if (parts.length !== 3) {
			return null;
		}

		// Вторая часть - это payload
		const payload = parts[1];
		
		// Декодируем из base64url
		const decoded = base64UrlDecode(payload);
		
		return JSON.parse(decoded);
	} catch (error) {
		console.error('Error decoding JWT:', error);
		return null;
	}
}

/**
 * Проверяет, истек ли токен
 */
export function isTokenExpired(token: string): boolean {
	const payload = decodeJWT(token);
	if (!payload || !payload.exp) {
		return true;
	}

	// exp в JWT указывается в секундах, а Date.now() возвращает миллисекунды
	return payload.exp * 1000 < Date.now();
}

/**
 * Декодирует base64url строку
 */
function base64UrlDecode(str: string): string {
	// Добавляем недостающие символы '=' для корректного декодирования
	let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
	const padding = base64.length % 4;
	if (padding) {
		base64 += '='.repeat(4 - padding);
	}

	// В браузере используем atob, на сервере - Buffer
	if (typeof window !== 'undefined') {
		return atob(base64);
	} else {
		return Buffer.from(base64, 'base64').toString('utf-8');
	}
}

/**
 * Извлекает роль пользователя из токена
 */
export function getRoleFromToken(token: string): string | null {
	const payload = decodeJWT(token);
	return payload?.role || null;
}