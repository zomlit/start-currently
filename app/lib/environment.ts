export const isProduction = process.env.NODE_ENV === "production";

export const getStripePublishableKey = () => {
  return isProduction
    ? process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST
    : process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST;
};

export const getStripeSecretKey = () => {
  return isProduction
    ? process.env.STRIPE_SECRET_KEY_TEST
    : process.env.STRIPE_SECRET_KEY_TEST;
};
