import { BASE_PATH, REQUEST_TIMEOUT_MS } from '../server-constants'
import type {
  Block,
  Heading1,
  Heading2,
  Heading3,
  RichText,
  Column,
} from './interfaces'
import { pathJoin } from './utils'

export const filePath = (url: URL): string => {
  const [dir, filename] = url.pathname.split('/').slice(-2)
  return pathJoin(BASE_PATH, `/notion/${dir}/${filename}`)
}

export const extractTargetBlocks = (
  blockType: string,
  blocks: Block[]
): Block[] => {
  const result: Block[] = []

  for (const block of blocks) {
    if (block.Type === blockType) {
      result.push(block)
    }

    // 子ブロックを持つコンテナから再帰的に抽出
    const children =
      block.ColumnList?.Columns
        ? _extractTargetBlockFromColumns(blockType, block.ColumnList.Columns)
        : block.BulletedListItem?.Children
          ? extractTargetBlocks(blockType, block.BulletedListItem.Children)
          : block.NumberedListItem?.Children
            ? extractTargetBlocks(blockType, block.NumberedListItem.Children)
            : block.ToDo?.Children
              ? extractTargetBlocks(blockType, block.ToDo.Children)
              : block.SyncedBlock?.Children
                ? extractTargetBlocks(blockType, block.SyncedBlock.Children)
                : block.Toggle?.Children
                  ? extractTargetBlocks(blockType, block.Toggle.Children)
                  : block.Paragraph?.Children
                    ? extractTargetBlocks(blockType, block.Paragraph.Children)
                    : block.Heading1?.Children
                      ? extractTargetBlocks(blockType, block.Heading1.Children)
                      : block.Heading2?.Children
                        ? extractTargetBlocks(blockType, block.Heading2.Children)
                        : block.Heading3?.Children
                          ? extractTargetBlocks(blockType, block.Heading3.Children)
                          : block.Quote?.Children
                            ? extractTargetBlocks(blockType, block.Quote.Children)
                            : block.Callout?.Children
                              ? extractTargetBlocks(blockType, block.Callout.Children)
                              : null

    if (children) {
      result.push(...children)
    }
  }

  return result
}

const _extractTargetBlockFromColumns = (
  blockType: string,
  columns: Column[]
): Block[] => {
  const result: Block[] = []
  for (const column of columns) {
    if (column.Children) {
      result.push(...extractTargetBlocks(blockType, column.Children))
    }
  }
  return result
}

export const buildURLToHTMLMap = async (
  urls: URL[]
): Promise<{ [key: string]: string }> => {
  const htmls: string[] = await Promise.all(
    urls.map(async (url: URL) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => {
        controller.abort()
      }, REQUEST_TIMEOUT_MS)

      return fetch(url.toString(), { signal: controller.signal })
        .then((res) => {
          return res.text()
        })
        .catch(() => {
          return ''
        })
        .finally(() => {
          clearTimeout(timeout)
        })
    })
  )

  return urls.reduce((acc: { [key: string]: string }, url, i) => {
    if (htmls[i]) {
      acc[url.toString()] = htmls[i]
    }
    return acc
  }, {})
}

export const getStaticFilePath = (path: string): string => {
  return pathJoin(BASE_PATH, path)
}

export const getNavLink = (nav: string) => {
  if ((!nav || nav === '/') && BASE_PATH) {
    return pathJoin(BASE_PATH, '') + '/'
  }

  return pathJoin(BASE_PATH, nav)
}

export const getPostLink = (slug: string) => {
  return pathJoin(BASE_PATH, `/posts/${slug}`)
}

export const getTagLink = (tag: string) => {
  return pathJoin(BASE_PATH, `/posts/tag/${encodeURIComponent(tag)}`)
}

export const getPageLink = (page: number, tag: string) => {
  if (page === 1) {
    return tag ? getTagLink(tag) : pathJoin(BASE_PATH, '/')
  }
  return tag
    ? pathJoin(
        BASE_PATH,
        `/posts/tag/${encodeURIComponent(tag)}/page/${page.toString()}`
      )
    : pathJoin(BASE_PATH, `/posts/page/${page.toString()}`)
}

export const getDateStr = (date: string) => {
  // 日付のみ (e.g. "2026-03-27") の場合はそのまま返す
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  // 日時+オフセット (e.g. "2026-03-27T00:30:00.000+09:00") の場合、
  // オフセットが示す現地時刻の日付を返す。
  // new Date() は UTC に変換してしまうため、UTC メソッドにオフセット分を加算して
  // 元のタイムゾーンでの日付を復元する。
  const dt = new Date(date)
  const offsetMatch = date.match(/([+-])(\d{2}):(\d{2})$/)
  const isUtcDateTime = /Z$/.test(date)

  if (offsetMatch || isUtcDateTime) {
    const offsetMinutes = offsetMatch
      ? (offsetMatch[1] === '+' ? 1 : -1) *
        (parseInt(offsetMatch[2], 10) * 60 + parseInt(offsetMatch[3], 10))
      : 0
    const localMs = dt.getTime() + offsetMinutes * 60 * 1000
    const local = new Date(localMs)
    const y = local.getUTCFullYear()
    const m = ('00' + (local.getUTCMonth() + 1)).slice(-2)
    const d = ('00' + local.getUTCDate()).slice(-2)
    return y + '-' + m + '-' + d
  }

  // オフセットなし日時 (e.g. "2026-03-27T00:30:00") はローカルTZ解釈
  const y = dt.getFullYear()
  const m = ('00' + (dt.getMonth() + 1)).slice(-2)
  const d = ('00' + dt.getDate()).slice(-2)
  return y + '-' + m + '-' + d
}

export const buildHeadingId = (heading: Heading1 | Heading2 | Heading3) => {
  return heading.RichTexts.map((richText: RichText) => {
    if (!richText.Text) {
      return ''
    }
    return richText.Text.Content
  })
    .join()
    .trim()
}

export const isTweetURL = (url: URL): boolean => {
  if (
    url.hostname !== 'twitter.com' &&
    url.hostname !== 'www.twitter.com' &&
    url.hostname !== 'x.com' &&
    url.hostname !== 'www.x.com'
  ) {
    return false
  }
  return /\/[^/]+\/status\/[\d]+/.test(url.pathname)
}

export const isTikTokURL = (url: URL): boolean => {
  if (url.hostname !== 'tiktok.com' && url.hostname !== 'www.tiktok.com') {
    return false
  }
  return /\/[^/]+\/video\/[\d]+/.test(url.pathname)
}

export const isInstagramURL = (url: URL): boolean => {
  if (
    url.hostname !== 'instagram.com' &&
    url.hostname !== 'www.instagram.com'
  ) {
    return false
  }
  return /\/p\/[^/]+/.test(url.pathname)
}

export const isPinterestURL = (url: URL): boolean => {
  if (
    url.hostname !== 'pinterest.com' &&
    url.hostname !== 'www.pinterest.com' &&
    url.hostname !== 'pinterest.jp' &&
    url.hostname !== 'www.pinterest.jp'
  ) {
    return false
  }
  return /\/pin\/[\d]+/.test(url.pathname)
}

export const isCodePenURL = (url: URL): boolean => {
  if (url.hostname !== 'codepen.io' && url.hostname !== 'www.codepen.io') {
    return false
  }
  return /\/[^/]+\/pen\/[^/]+/.test(url.pathname)
}

export const isGitHubURL = (url: URL): boolean => {
  if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
    return false
  }
  return /\/[^/]+\/[^/]+\/blob\/[^/]+\/.+/.test(url.pathname)
}

export const isShortAmazonURL = (url: URL): boolean => {
  if (url.hostname === 'amzn.to' || url.hostname === 'www.amzn.to') {
    return true
  }
  return false
}

export const isFullAmazonURL = (url: URL): boolean => {
  if (
    url.hostname === 'amazon.com' ||
    url.hostname === 'www.amazon.com' ||
    url.hostname === 'amazon.co.jp' ||
    url.hostname === 'www.amazon.co.jp'
  ) {
    return true
  }
  return false
}

export const isAmazonURL = (url: URL): boolean => {
  return isShortAmazonURL(url) || isFullAmazonURL(url)
}

export const isYouTubeURL = (url: URL): boolean => {
  if (['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) {
    return true
  }
  return false
}

// Supported URL
//
// - https://youtu.be/0zM3nApSvMg
// - https://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index
// - https://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s
// - https://www.youtube.com/watch?v=0zM3nApSvMg
// - https://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0
// - https://www.youtube.com/embed/0zM3nApSvMg?rel=0
// - https://youtube.com/live/uOLwqWlpKbA
export const parseYouTubeVideoId = (url: URL): string => {
  if (!isYouTubeURL(url)) return ''

  if (url.hostname === 'youtu.be') {
    return url.pathname.split('/')[1]
  } else if (url.pathname === '/watch') {
    return url.searchParams.get('v') || ''
  } else {
    const elements = url.pathname.split('/')

    if (elements.length < 2) return ''

    if (
      elements[1] === 'v' ||
      elements[1] === 'embed' ||
      elements[1] === 'live'
    ) {
      return elements[2]
    }
  }

  return ''
}
