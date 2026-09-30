import type { CapacitorConfig } from "@capacitor/cli";

// The app loads the live site, so listings, reviews and fixes ship without an
// app-store update. Native plugins (location, splash, status bar) are exposed
// to the site through the Capacitor bridge — see lib/native.ts in the web app.
const config: CapacitorConfig = {
  appId: "com.matfinderbjj.app",
  appName: "Mat Finder",
  webDir: "www",
  server: {
    url: "https://www.matfinderbjj.com",
    cleartext: false,
    // Links to other sites (gym websites, Google Maps) open outside the app.
    allowNavigation: ["www.matfinderbjj.com", "matfinderbjj.com"],
  },
  backgroundColor: "#101613",
  ios: {
    contentInset: "automatic",
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: "#101613",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#101613",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#101613",
    },
  },
};

export default config;
