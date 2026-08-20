import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.darkcube.diary',
  appName: '墨辰DarkCube',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  }
}

export default config
