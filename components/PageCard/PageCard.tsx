"use client"

import { Box, Typography } from "@mui/material"
import styles from "./page-card.module.scss"
import { Database } from "@/database.types"
import { MouseEventHandler } from "react"
import { darken } from "@mui/material/styles"
import Color from "colorjs.io"

type Props = {
  title: string
  description: string
  onClick: MouseEventHandler<HTMLDivElement> | undefined
  styles: {
    backgroundColor: Color
  }
}

const PageCard = ({ title, description, onClick, styles }: Props) => {
  return (
    <Box
      sx={{
        paddingX: 4,
        paddingY: 3,
        borderRadius: 2,
        backgroundColor: styles.backgroundColor.toString({ format: "hex" }),
        cursor: "pointer",
        "&:hover": { backgroundColor: darken(styles.backgroundColor.toString({ format: "hex" }), 0.2) },
        height: "40vh",
      }}
      onClick={onClick}
    >
      <Box sx={{ height: "100%", overflow: "hidden" }}>
        <Typography variant="h6" fontWeight="bold" marginBottom={1}>
          {title}
        </Typography>
        <Typography variant="caption" component="p">
          {description}
        </Typography>
      </Box>
    </Box>
  )
}

export default PageCard
