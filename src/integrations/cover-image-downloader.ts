import type { AstroIntegration } from 'astro'
import { getDatabase, downloadFile } from '../lib/notion/client'

export default (): AstroIntegration => ({
  name: 'cover-image-downloader',
  hooks: {
    'astro:build:start': async () => {
      let database
      try {
        database = await getDatabase()
      } catch (error) {
        console.warn(
          'Skipping Notion cover image download because database metadata could not be loaded.',
          error
        )
        return Promise.resolve()
      }

      if (!database.Cover || database.Cover.Type !== 'file') {
        return Promise.resolve()
      }

      let url!: URL
      try {
        url = new URL(database.Cover.Url)
      } catch (error) {
        console.warn('Skipping Notion cover image download because URL was invalid.', error)
        return Promise.resolve()
      }

      return downloadFile(url)
    },
  },
})
