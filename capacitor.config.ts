import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.darkcube.diary',
  appName: '墨辰',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  }
}

export default config
