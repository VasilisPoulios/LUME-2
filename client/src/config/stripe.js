import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Configure Stripe Elements options
const stripeOptions = {
  // This will silence some development warnings
  loader: 'auto',
};

export { stripePromise, stripeOptions }; 