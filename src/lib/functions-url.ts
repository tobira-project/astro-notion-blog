const DEFAULT_FUNCTIONS_ORIGIN =
  'https://asia-northeast1-tobiratory-f6ae1.cloudfunctions.net'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

export function getFunctionsOrigin(baseUrl?: string) {
  const normalized = trimTrailingSlash(baseUrl?.trim() || '')
  return normalized || DEFAULT_FUNCTIONS_ORIGIN
}

export function getNativeApiBaseUrl(baseUrl?: string) {
  const origin = getFunctionsOrigin(baseUrl)

  if (origin.endsWith('/native') || origin.endsWith('/nativeV2')) {
    return origin
  }

  return `${origin}/native`
}

export function getBlogFunctionUrl(
  baseUrl: string | undefined,
  functionName: string
) {
  const origin = getFunctionsOrigin(baseUrl)

  if (origin.endsWith(`/${functionName}`)) {
    return origin
  }

  return `${origin}/${functionName}`
}
