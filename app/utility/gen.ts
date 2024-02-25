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

export function colorToAlphaHex(color: string): string {
  return `${color}28`
}

/**
 * Gets the minimum amount of text for the current selection of text
 *
 *
 * @example
 *
 * This is some text and some more text.
 *
 * Say that both "some" words were selected; This function would return "some text and some"
 */
export const getMinimumTextFromSelectedText = (fullText: string, currentlySelectedWordIndeces: Array<number>) => {
  // find the start and end indeces
  // sort the selected word indeces and just take the first and last
  // create a copy of the currently selected words
  const selectedWordIndecesAsc = [...currentlySelectedWordIndeces]

  // sort the words by the indeces
  selectedWordIndecesAsc.sort((a, b) => a - b)

  const minStartIndex = selectedWordIndecesAsc[0]
  const minEndIndex = selectedWordIndecesAsc[selectedWordIndecesAsc.length - 1] + 1

  return fullText.split(" ").slice(minStartIndex, minEndIndex).join(" ")
}
