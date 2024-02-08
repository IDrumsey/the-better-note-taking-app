"use client"

import { Box, Typography } from "@mui/material"
import styles from "./page-card.module.scss"
import { Database } from "@/database.types"
import { MouseEventHandler } from "react"

type Props = {
  page: Database["public"]["Tables"]["pages"]["Row"]
  onClick: MouseEventHandler<HTMLDivElement> | undefined
}

const PageCard = ({ page, onClick }: Props) => {
  return (
    <Box sx={{ paddingX: 4, paddingY: 3, borderRadius: 2, backgroundColor: "primary.dark" }} onClick={onClick}>
      <Typography variant="h6" fontWeight="bold">
        {page.title}
      </Typography>
      <Typography variant="caption" maxHeight={2} className={styles["text"]}>
        {page.text}
      </Typography>
    </Box>
  )
}

export default PageCard
