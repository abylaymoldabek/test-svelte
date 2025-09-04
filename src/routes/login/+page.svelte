<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.js';
	import { authService } from '$lib/services/auth.js';
	import type { LoginCredentials } from '$lib/types/auth.js';

	let email = '';
	let password = '';
	let showPassword = false;
	let isLoading = false;
	let error = '';

	async function handleSubmit() {
		if (isLoading) return;
		
		error = '';
		isLoading = true;
		authStore.setLoading(true);
		
		try {
			const credentials: LoginCredentials = { email, password };
			const response = await authService.login(credentials);
			
			authService.storeTokens(response.token, response.refreshToken);
			
			authStore.setUser(response.user);
			
			await goto('/dashboard');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
		} finally {
			isLoading = false;
			authStore.setLoading(false);
		}
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<svelte:head>
	<title>Sign in - Okto</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<div class="logo-container">
			<img src="/okto-logo-original.png" alt="Okto logo" class="logo" />
		</div>
		
		<h1 class="auth-title">Sign in</h1>
		
		{#if error}
			<div class="error-message">
				{error}
			</div>
		{/if}
		
		<form on:submit|preventDefault={handleSubmit} class="auth-form">
			<div class="form-group">
				<label for="email" class="form-label">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="form-input"
					placeholder="Enter your email"
				/>
			</div>
			
			<div class="form-group">
				<label for="password" class="form-label">Password</label>
				<div class="password-input-container">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						required
						class="form-input password-input"
						placeholder="Enter your password"
					/>
					<button
						type="button"
						class="password-toggle"
						on:click={togglePasswordVisibility}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
								<line x1="1" y1="1" x2="23" y2="23"></line>
							</svg>
						{:else}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
						{/if}
					</button>
				</div>
			</div>
			
			<div class="forgot-password">
				<a href="/forgot-password" class="forgot-link">Forgot password?</a>
			</div>
			
			<button type="submit" class="submit-btn" disabled={isLoading}>
				{#if isLoading}
					<svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
						<path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
					</svg>
					Signing in...
				{:else}
					Sign in
				{/if}
			</button>
		</form>
		
		<div class="auth-footer">
			<p>Don't have an account? <a href="/register" class="register-link">Sign up</a></p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}
	
	.auth-card {
		background: white;
		border-radius: 12px;
		padding: 40px;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
	}
	
	.logo-container {
		text-align: center;
		margin-bottom: 30px;
	}
	
	.logo {
		height: 32px;
		width: auto;
		filter: brightness(0) saturate(100%);
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-mask: url('/okto-logo-original.png') no-repeat center;
		mask: url('/okto-logo-original.png') no-repeat center;
		-webkit-mask-size: contain;
		mask-size: contain;
	}
	
	.auth-title {
		font-size: 28px;
		font-weight: 700;
		text-align: center;
		margin-bottom: 30px;
		color: #1a202c;
	}
	
	.error-message {
		background: #fef2f2;
		color: #dc2626;
		padding: 12px 16px;
		border-radius: 8px;
		border: 1px solid #fecaca;
		margin-bottom: 20px;
		font-size: 14px;
		text-align: center;
	}
	
	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.form-label {
		font-weight: 600;
		color: #374151;
		font-size: 14px;
	}
	
	.form-input {
		padding: 12px 16px;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		font-size: 16px;
		transition: all 0.2s ease;
		background: white;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		outline: none;
		width: 100%;
	}
	
	.form-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
	
	.password-input-container {
		position: relative;
	}
	
	.password-input {
		padding-right: 50px;
	}
	
	.password-toggle {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280;
		padding: 4px;
		border-radius: 4px;
		transition: color 0.2s ease;
	}
	
	.password-toggle:hover {
		color: #374151;
	}
	
	.forgot-password {
		text-align: right;
		margin-top: -10px;
	}
	
	.forgot-link {
		color: #667eea;
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
	}
	
	.forgot-link:hover {
		text-decoration: underline;
	}
	
	.submit-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 14px 24px;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-top: 10px;
	}
	
	.submit-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
	}
	
	.submit-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}
	
	.spinner {
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
	
	.auth-footer {
		text-align: center;
		margin-top: 30px;
		padding-top: 20px;
		border-top: 1px solid #e5e7eb;
	}
	
	.auth-footer p {
		color: #6b7280;
		margin: 0;
	}
	
	.register-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
	}
	
	.register-link:hover {
		text-decoration: underline;
	}
	
	@media (max-width: 480px) {
		.auth-card {
			padding: 30px 20px;
		}
		
		.auth-title {
			font-size: 24px;
		}
	}
</style>
