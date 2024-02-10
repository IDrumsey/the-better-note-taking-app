"use client"

import { Box, Typography } from "@mui/material"
import styles from "./page-card.module.scss"
import { Database } from "@/database.types"
import { MouseEventHandler } from "react"

type Props = {
  title: string
  description: string
  onClick: MouseEventHandler<HTMLDivElement> | undefined
}

const PageCard = ({ title, description, onClick }: Props) => {
  return (
    <Box
      sx={{
        paddingX: 4,
        paddingY: 3,
        borderRadius: 2,
        backgroundColor: "#242424",
        cursor: "pointer",
        "&:hover": { backgroundColor: "#2E2E2E" },
        height: "40vh",
      }}
      onClick={onClick}
    >
      <Box sx={{ height: "100%", overflow: "hidden" }}>
        <Typography variant="h6" fontWeight="bold" marginBottom={1}>
          {title}
        </Typography>
        <Typography variant="caption" component="p" className={styles["text"]}>
          {description}
        </Typography>
      </Box>
    </Box>
  )
}

export default PageCard
