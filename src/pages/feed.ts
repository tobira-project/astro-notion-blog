import rss from '@astrojs/rss'
import { getAllPosts, getDatabase } from '../lib/notion/client.ts'
import { getPostLink } from '../lib/blog-helpers.ts'

export async function GET() {
  const [posts, database] = await Promise.all([getAllPosts(), getDatabase()])

  return rss({
    title: database.Title || 'TOBIRACAST',
    description: database.Description || 'Tobiratory公式ポータルサイト',
    site: import.meta.env.SITE,
    items: posts.map((post) => ({
      link: new URL(getPostLink(post.Slug), import.meta.env.SITE).toString(),
      title: post.Title,
      description: post.Excerpt,
      pubDate: new Date(post.Date),
    })),
  })
}
