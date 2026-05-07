import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Update this to match the package name registered on the Google Play Console
  appId: 'com.billgenerator.app',
  appName: 'Bill Generator',
  // Angular production build output
  webDir: 'dist/bill-generator-ui/browser',
  server: {
    androidScheme: 'https',
  },
};

export default config;
