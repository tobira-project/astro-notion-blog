import type { AstroIntegration } from 'astro'
import type { FileObject } from '../lib/interfaces'
import { getDatabase, downloadFile } from '../lib/notion/client'

export default (): AstroIntegration => ({
  name: 'custom-icon-downloader',
  hooks: {
    'astro:build:start': async () => {
      let database
      try {
        database = await getDatabase()
      } catch (error) {
        console.warn(
          'Skipping Notion custom icon download because database metadata could not be loaded.',
          error
        )
        return Promise.resolve()
      }

      if (!database.Icon || database.Icon.Type !== 'file') {
        return Promise.resolve()
      }

      const icon = database.Icon as FileObject

      let url!: URL
      try {
        url = new URL(icon.Url)
      } catch (error) {
        console.warn(
          'Skipping Notion custom icon download because URL was invalid.',
          error
        )
        return Promise.resolve()
      }

      return downloadFile(url)
    },
  },
})
