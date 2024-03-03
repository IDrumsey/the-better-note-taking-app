import { getMinimumTextFromSelectedText } from "./app/utility/gen"
import { expect, test } from "vitest"

test("getMinimumTextFromSelectedText", () => {
  expect(getMinimumTextFromSelectedText("This is some test text and some more text.", [2, 4, 5, 7])).toBe(
    "some test text and some more"
  )
})
