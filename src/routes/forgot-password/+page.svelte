<script lang="ts">
	import { authService } from '$lib/services/auth.js';

	let email = '';
	let isLoading = false;
	let isSubmitted = false;

	async function handleSubmit() {
		isLoading = true;
		
		try {
			await authService.requestPasswordReset({ email });
			isSubmitted = true;
		} catch (err) {
			console.error('Password reset error:', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Forgot Password - Okto</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<div class="logo-container">
			<img src="/okto-logo-original.png" alt="Okto logo" class="logo" />
		</div>
		
		{#if !isSubmitted}
			<h1 class="auth-title">Forgot Password?</h1>
			<p class="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
			
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
				
				<button type="submit" class="submit-btn" disabled={isLoading}>
					{#if isLoading}
						<svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
							<path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
						</svg>
						Sending...
					{:else}
						Send Reset Link
					{/if}
				</button>
			</form>
		{:else}
			<div class="success-container">
				<div class="success-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="20,6 9,17 4,12"></polyline>
					</svg>
				</div>
				<h1 class="auth-title">Check your email</h1>
				<p class="auth-subtitle">We've sent a password reset link to <strong>{email}</strong></p>
				<p class="auth-subtitle small">Didn't receive the email? Check your spam folder or <button class="resend-btn" on:click={() => isSubmitted = false}>try again</button>.</p>
			</div>
		{/if}
		
		<div class="auth-footer">
			<p><a href="/login" class="back-link">← Back to Sign in</a></p>
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
		margin-bottom: 15px;
		color: #1a202c;
	}
	
	.auth-subtitle {
		text-align: center;
		color: #6b7280;
		margin-bottom: 30px;
		line-height: 1.5;
	}
	
	.auth-subtitle.small {
		font-size: 14px;
		margin-top: 20px;
		margin-bottom: 0;
	}
	
	.success-container {
		text-align: center;
	}
	
	.success-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: #dcfce7;
		border-radius: 50%;
		color: #16a34a;
		margin-bottom: 20px;
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
	
	.resend-btn {
		background: none;
		border: none;
		color: #667eea;
		text-decoration: underline;
		cursor: pointer;
		font-size: inherit;
		padding: 0;
	}
	
	.resend-btn:hover {
		color: #4f46e5;
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
	
	.back-link {
		color: #667eea;
		text-decoration: none;
		font-weight: 600;
	}
	
	.back-link:hover {
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
