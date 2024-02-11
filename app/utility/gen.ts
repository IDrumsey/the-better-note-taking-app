type InternalCustomError = {
  code?: number
  message?: string
  internalError: any
}

// https://dev.to/ivanzm123/say-goodbye-trycatch-hell-336o
export function tryStuff<T extends any[], K>(
  func: (...args: T) => K,
  ...params: T
): [K, null] | [null, InternalCustomError] {
  try {
    return [func(...params), null]
  } catch (e) {
    return [null, { internalError: e }]
  }
}
