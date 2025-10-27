<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.js';
	import { tokenPayload } from '$lib/stores/token.js';
	import { useAuthGuard } from '$lib/utils/auth-guard.js';

	let user: any = null;
	let authGuard: { isAuthorized: boolean; cleanup: () => void; checkAuth: () => Promise<boolean>; } | null = null;

	onMount(() => {
		// Initialize auth guard
		authGuard = useAuthGuard('/dashboard');

		// Subscribe to auth store for user info
		const unsubscribe = authStore.subscribe(state => {
			user = state.user;
		});

		return unsubscribe;
	});

	onDestroy(() => {
		if (authGuard) {
			authGuard.cleanup();
		}
	});

	async function handleLogout() {
		await authStore.logout();
		await goto('/');
	}
</script>

<svelte:head>
	<title>Dashboard - Okto</title>
</svelte:head>

{#if $tokenPayload && user}
	<div class="dashboard">
		<header class="dashboard-header">
			<div class="header-content">
				<div class="logo-section">
					<img src="/okto-logo-original.png" alt="Okto" class="logo" />
				</div>
				
				<div class="user-section">
					<div class="user-info">
						<span class="user-name">Welcome, {user.firstName}!</span>
						<span class="user-email">{user.email}</span>
					</div>
					<button class="logout-btn" on:click={handleLogout}>
						Logout
					</button>
				</div>
			</div>
		</header>
		
		<main class="dashboard-main">
			<div class="container">
				<p>Здесь будет текст</p>
				
				<div class="cards-grid">
					<div class="card">
						<h3>Total Balance</h3>
						<p class="amount">$12,345.67</p>
					</div>
					
					<div class="card">
						<h3>Monthly Income</h3>
						<p class="amount income">+$5,000.00</p>
					</div>
					
					<div class="card">
						<h3>Monthly Expenses</h3>
						<p class="amount expense">-$3,200.45</p>
					</div>
					
					<div class="card">
						<h3>Savings Goal</h3>
						<p class="amount">$2,144.22</p>
						<div class="progress-bar">
							<div class="progress" style="width: 68%"></div>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
{:else}
	<div class="loading-container">
		<div class="loading-spinner"></div>
		<p>Проверка авторизации...</p>
	</div>
{/if}

<style>
	.dashboard {
		min-height: 100vh;
		background: #f8fafc;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #f8fafc;
		gap: 1rem;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e5e7eb;
		border-top: 4px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-container p {
		color: #6b7280;
		font-size: 1rem;
		margin: 0;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.dashboard-header {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		padding: 1rem 0;
	}
	
	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.logo-section .logo {
		height: 28px;
		width: auto;
	}
	
	.user-section {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	
	.user-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	
	.user-name {
		font-weight: 600;
		color: #1a202c;
	}
	
	.user-email {
		font-size: 14px;
		color: #6b7280;
	}
	
	.logout-btn {
		background: #ef4444;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}
	
	.logout-btn:hover {
		background: #dc2626;
	}
	
	.dashboard-main {
		padding: 40px 0;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
	}
	
	.dashboard-main p {
		color: #6b7280;
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}
	
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		margin-top: 2rem;
	}
	
	.card {
		background: white;
		padding: 24px;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
	}
	
	.card h3 {
		font-size: 14px;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 8px;
	}
	
	.amount {
		font-size: 2rem;
		font-weight: 700;
		color: #1a202c;
		margin-bottom: 16px;
	}
	
	.amount.income {
		color: #16a34a;
	}
	
	.amount.expense {
		color: #dc2626;
	}
	
	.progress-bar {
		width: 100%;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
	}
	
	.progress {
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		transition: width 0.3s ease;
	}
	
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
	
	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: 16px;
		}
		
		.user-section {
			flex-direction: column;
			gap: 12px;
		}
		
		.user-info {
			align-items: center;
		}
		
		.cards-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
