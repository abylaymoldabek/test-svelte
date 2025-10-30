import type { User } from '$lib/types/auth';

export const ROLES = {
	SUPERADMIN: 'superadmin',
	ADMIN: 'admin',
	USER: 'user'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Проверяет, является ли пользователь суперадмином
 */
export function isSuperAdmin(user: User | null): boolean {
    console.log('User role:', user?.role);
	return user?.role === ROLES.SUPERADMIN;
}

/**
 * Проверяет, является ли пользователь администратором (включая суперадмина)
 */
export function isAdmin(user: User | null): boolean {
	return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN;
}

/**
 * Проверяет, имеет ли пользователь минимальную необходимую роль
 */
export function hasRole(user: User | null, requiredRole: Role): boolean {
	if (!user?.role) return false;
	
	const roleHierarchy = {
		[ROLES.USER]: 1,
		[ROLES.ADMIN]: 2,
		[ROLES.SUPERADMIN]: 3
	};
	
	const userLevel = roleHierarchy[user.role as Role] || 0;
	const requiredLevel = roleHierarchy[requiredRole] || 0;
	
	return userLevel >= requiredLevel;
}