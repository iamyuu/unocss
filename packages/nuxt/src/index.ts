import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { addComponentsDir, addPluginTemplate, defineNuxtModule, extendViteConfig, extendWebpackConfig } from '@nuxt/kit'
import WebpackPlugin from '@unocss/webpack'
import VitePlugin from '@unocss/vite'

import presetUno from '@unocss/preset-uno'
import presetAttributify from '@unocss/preset-attributify'
import presetIcons from '@unocss/preset-icons'
import presetWebFonts from '@unocss/preset-web-fonts'
import presetTypography from '@unocss/preset-typography'

import type { PresetUnoOptions } from '@unocss/preset-uno'
import type { AttributifyOptions } from '@unocss/preset-attributify'
import type { IconsOptions } from '@unocss/preset-icons'
import type { UserConfig } from '@unocss/core'
import type { WebFontsOptions } from '@unocss/preset-web-fonts'
import type { TypographyOptions } from '@unocss/preset-typography'

const dir = dirname(fileURLToPath(import.meta.url))

export interface UnocssNuxtOptions extends UserConfig {
  /**
   * Injecting `uno.css` entry
   *
   * @default true
   */
  autoImport?: boolean

  /**
   * Injecting `@unocss/reset/tailwind.css` entry
   *
   * @default false
   */
  preflight?: boolean

  /**
   * Installing UnoCSS components
   * - `<UnoIcon>`
   *
   * @default true
   */
  components?: boolean

  /**
   * Enable the default preset
   * Only works when `presets` is not specified
   * @default true
   */
  uno?: boolean | PresetUnoOptions

  /**
   * Enable attributify mode and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  attributify?: boolean | AttributifyOptions

  /**
   * Enable icons preset and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  icons?: boolean | IconsOptions

  /**
   * Enable web fonts preset and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  webFonts?: boolean | WebFontsOptions

  /**
   * Enable typography preset and the options of it
   * Only works when `presets` is not specified
   * @default false
   */
  typography?: boolean | TypographyOptions
}

export default defineNuxtModule<UnocssNuxtOptions>({
  meta: {
    name: 'unocss',
    configKey: 'unocss',
  },
  defaults: {
    autoImport: true,
    preflight: false,
    components: true,

    // presets
    uno: true,
    attributify: false,
    webFonts: false,
    icons: false,
  },
  setup(options) {
    // preset shortcuts
    if (options.presets == null) {
      options.presets = []
      if (options.uno)
        options.presets.push(presetUno(typeof options.uno === 'boolean' ? {} : options.uno))
      if (options.attributify)
        options.presets.push(presetAttributify(typeof options.attributify === 'boolean' ? {} : options.attributify))
      if (options.icons)
        options.presets.push(presetIcons(typeof options.icons === 'boolean' ? {} : options.icons))
      if (options.webFonts)
        options.presets.push(presetWebFonts(typeof options.webFonts === 'boolean' ? {} : options.webFonts))
      if (options.typography)
        options.presets.push(presetTypography(typeof options.typography === 'boolean' ? {} : options.typography))
    }

    if (options.autoImport) {
      addPluginTemplate({
        filename: 'unocss.mjs',
        getContents: () => {
          const lines = [
            'import \'uno.css\'',
            'export default () => {};',
          ]
          if (options.preflight)
            lines.unshift('import \'@unocss/reset/tailwind.css\'')
          return lines.join('\n')
        },
      })
    }

    if (options.components) {
      addComponentsDir({
        path: resolve(dir, '../runtime'),
        watch: false,
      })
    }

    extendViteConfig((config) => {
      config.plugins = config.plugins || []
      config.plugins.unshift(...VitePlugin(options))
    })

    extendWebpackConfig((config) => {
      config.plugins = config.plugins || []
      config.plugins.unshift(WebpackPlugin(options))
    })
  },
})

declare module '@nuxt/schema' {
  interface NuxtConfig {
    unocss?: UnocssNuxtOptions
  }
  interface NuxtOptions {
    unocss?: UnocssNuxtOptions
  }
}
