<div class="hero">
	<div class="logo-container">
		<img src="/okto-logo-original.png" alt="Okto" class="logo" />
	</div>
	
	<h1>Welcome to Okto</h1>
	<p>Здесь будет описание приложения</p>
	
	<div class="auth-buttons">
		<a href="/login" class="btn btn-primary">Sign In</a>
		<a href="/register" class="btn btn-secondary">Sign Up</a>
	</div>
</div>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		text-align: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 20px;
	}
	
	.logo-container {
		margin-bottom: 30px;
	}
	
	.logo {
		height: 40px;
		width: auto;
	}
	
	h1 {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: white;
	}
	
	p {
		font-size: 1.25rem;
		margin-bottom: 2rem;
		opacity: 0.9;
	}
	
	.auth-buttons {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;
	}
	
	.btn {
		padding: 12px 24px;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s ease;
		display: inline-block;
		min-width: 120px;
		text-align: center;
	}
	
	.btn-primary {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}
	
	.btn-primary:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-2px);
	}
	
	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid white;
	}
	
	.btn-secondary:hover {
		background: #f8fafc;
		transform: translateY(-2px);
	}
	
	@media (max-width: 768px) {
		h1 {
			font-size: 2.5rem;
		}
		
		.auth-buttons {
			flex-direction: column;
			align-items: center;
		}
		
		.btn {
			width: 200px;
		}
	}
</style>
