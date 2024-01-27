import { Box, Typography } from "@mui/material"
import { MouseEventHandler, forwardRef, useEffect, useState } from "react"
import Letter from "./letter"

type HighlightDetails = {
  start_word_index: number
  end_word_index: number
  color: string | null
}

type TextPiece = HighlightDetails & {
  highlightable: boolean
  highlighted: boolean
}

type Props = {
  text: string
  highlights: Array<HighlightDetails>
  onMouseDown?: MouseEventHandler<HTMLSpanElement> | undefined
  onMouseUp?: MouseEventHandler<HTMLSpanElement> | undefined
}

const HighlightedText = forwardRef<HTMLSpanElement, Props>(
  ({ text, highlights, onMouseDown, onMouseUp }, ref) => {
    const splitText = (
      fullText: string,
      highlights: Array<HighlightDetails>
    ): Array<TextPiece> => {
      const words = fullText.split(" ")

      const sortedHighlights = highlights.sort(
        (a, b) => a.start_word_index - b.start_word_index
      )

      let lastEndIndex = 0
      const textPieces: Array<TextPiece> = []

      sortedHighlights.forEach(
        ({ start_word_index, end_word_index, color }) => {
          if (start_word_index > lastEndIndex) {
            textPieces.push({
              start_word_index: lastEndIndex,
              end_word_index: start_word_index - 1,
              highlightable: false,
              highlighted: false,
              color: null,
            })
          }

          textPieces.push({
            start_word_index,
            end_word_index,
            highlightable: true,
            highlighted: true,
            color,
          })

          lastEndIndex = end_word_index + 1
        }
      )

      if (lastEndIndex < words.length) {
        textPieces.push({
          start_word_index: lastEndIndex,
          end_word_index: words.length - 1,
          highlightable: false,
          highlighted: false,
          color: null,
        })
      }

      return textPieces
    }

    const [textPieces, textPiecesSetter] = useState<Array<TextPiece> | null>(
      null
    )

    useEffect(() => {
      textPiecesSetter(splitText(text, highlights))
    }, [])

    const getTextPieceText = (
      fullText: string,
      start_word_index: number,
      end_word_index: number
    ): string => {
      const words = fullText.split(" ")

      return words.slice(start_word_index, end_word_index).join(" ")
    }

    return (
      <Typography
        variant="body1"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        sx={{ lineHeight: 3 }}
      >
        {text.split("").map((letter, i) => (
          <Letter
            key={i}
            text={letter}
          />
        ))}
      </Typography>
    )
  }
)

export default HighlightedText
