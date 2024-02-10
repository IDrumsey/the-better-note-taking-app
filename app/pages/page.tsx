"use client"

import { createClient } from "@/utils/supabase/client"
import { Grid, Skeleton, Typography } from "@mui/material"
import PageCard from "@/components/PageCard/PageCard"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Database } from "@/database.types"

type Props = {}

const PagePage = ({}: Props) => {
  const router = useRouter()

  const supabase = createClient()

  const [pages, pagesSetter] = useState<Array<Database["public"]["Tables"]["pages"]["Row"]> | null>(null)
  const [pagesLoading, pagesLoadingSetter] = useState<boolean>(true)

  useEffect(() => {
    const loadHandler = async () => {
      const { data, error } = await supabase.from("pages").select()

      if (!error) {
        pagesSetter(data)
      }

      pagesLoadingSetter(false)
    }

    loadHandler()
  }, [])

  const onPageCardClick = (pageId: number) => {
    router.push(`/pages/${pageId}`)
  }

  return (
    <>
      <Grid container spacing={2} sx={{ marginTop: 2, paddingX: 4 }}>
        {pagesLoading ? (
          <Skeleton variant="text" />
        ) : pages ? (
          // create card for each page
          pages.map((page, i) => (
            <Grid item key={i} xs={4}>
              <PageCard page={page} onClick={() => onPageCardClick(page.id)} />
            </Grid>
          ))
        ) : (
          // error card
          <Typography variant="h1">Failed to load your pages.</Typography>
        )}
      </Grid>
    </>
  )
}

export default PagePage
