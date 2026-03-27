import type { AstroIntegration } from 'astro'
import { getAllPosts, downloadFile } from '../lib/notion/client'

export default (): AstroIntegration => ({
  name: 'featured-image-downloader',
  hooks: {
    'astro:build:start': async () => {
      let posts
      try {
        posts = await getAllPosts()
      } catch (error) {
        console.warn(
          'Skipping Notion featured image downloads because posts could not be loaded.',
          error
        )
        return
      }

      await Promise.allSettled(
        posts.map((post) => {
          if (!post.FeaturedImage || !post.FeaturedImage.Url) {
            return Promise.resolve()
          }

          let url!: URL
          try {
            url = new URL(post.FeaturedImage.Url)
          } catch (error) {
            console.warn(
              `Skipping featured image download for post "${post.Slug}" because URL was invalid.`,
              error
            )
            return Promise.resolve()
          }

          return downloadFile(url)
        })
      )
    },
  },
})
