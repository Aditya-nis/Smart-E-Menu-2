import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          signup: path.resolve(__dirname, 'signup.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
          menu: path.resolve(__dirname, 'menu.html'),
          cart: path.resolve(__dirname, 'cart.html'),
          orderTracking: path.resolve(__dirname, 'order-tracking.html'),
          kitchenDashboard: path.resolve(__dirname, 'kitchen-dashboard.html'),
          bill: path.resolve(__dirname, 'bill.html'),
          profile: path.resolve(__dirname, 'profile.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
