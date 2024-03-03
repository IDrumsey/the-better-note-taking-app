// import styles from ''

import { Box } from "@mui/material"
import { MouseEventHandler, useEffect, useRef, useState } from "react"

type Props = {
  text: string
  index: number
  onWordHover: (index: number, targetElement: HTMLSpanElement | undefined) => void
  onWordMouseDown: (index: number) => void
  highlighted: boolean
  highlightColor?: string
}

const Word = ({ text, index, onWordHover, highlighted, onWordMouseDown, highlightColor }: Props) => {
  const [hovering, hoveringSetter] = useState<boolean>(false)

  const ref = useRef<HTMLSpanElement>()

  const onMouseEnter: MouseEventHandler<HTMLSpanElement> = (e) => {
    hoveringSetter(true)
  }

  const onMouseExit = () => {
    hoveringSetter(false)
  }

  useEffect(() => {
    if (hovering) {
      onWordHover(index, ref.current)
    }
  }, [hovering])

  return (
    <Box
      ref={ref}
      component="span"
      sx={{
        backgroundColor: highlighted ? highlightColor : "#00000000",
        borderRadius: 1,
        paddingY: 0.5,
        paddingX: 0.5,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseExit}
      onMouseDown={() => onWordMouseDown(index)}
    >
      {text}
    </Box>
  )
}

export default Word
