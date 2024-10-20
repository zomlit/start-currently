export const isProduction = import.meta.env.VITE_NODE_ENV === "production";

export const getStripePublishableKey = () => {
  return isProduction
    ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_LIVE
    : import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST;
};

export const getStripeSecretKey = () => {
  return isProduction
    ? import.meta.env.VITE_STRIPE_SECRET_KEY_LIVE
    : import.meta.env.VITE_STRIPE_SECRET_KEY_TEST;
};
