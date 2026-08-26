// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('$lib/types').AuthenticatedUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		Razorpay?: new (options: Record<string, unknown>) => {
			open: () => void;
			on: (event: string, callback: (response: any) => void) => void;
		};
	}
}

export {};
