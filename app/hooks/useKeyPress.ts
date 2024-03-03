import { useState, useEffect } from "react"

export const useKeyPress = (targetKey: string, callback: () => void) => {
  const handler = (e: KeyboardEvent) => {
    if (e.defaultPrevented) {
      return
    }

    if (e.key == targetKey) {
      // run the callback
      callback()
    }
  }
  useEffect(() => {
    window.addEventListener("keydown", handler)

    return () => window.removeEventListener("keydown", handler)
  }, [callback])
}
