export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	avatar?: string;
	createdAt: string;
	updatedAt: string;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

export interface AuthResponse {
	user: User;
	token: string;
	refreshToken: string;
}

export interface AuthError {
	message: string;
	field?: string;
}

export interface ResetPasswordRequest {
	email: string;
}

export interface ResetPasswordConfirm {
	token: string;
	newPassword: string;
}
