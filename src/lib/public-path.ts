export function withBasePath(path: string): string {
  if (/^(https?:)?\/\//.test(path)) {
    return path
  }

  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path

  return new URL(normalizedPath, `https://example.com${baseUrl}`).pathname
}
