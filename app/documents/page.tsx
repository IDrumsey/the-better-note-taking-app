"use client"

import { createClient } from "@/utils/supabase/client"
import { Grid, Skeleton, Typography } from "@mui/material"
import PageCard from "@/components/PageCard/PageCard"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Database } from "@/database.types"
import Color from "colorjs.io"

type Props = {}

const DocumentsPage = ({}: Props) => {
  const router = useRouter()

  const supabase = createClient()

  const [pages, pagesSetter] = useState<Array<Database["public"]["Tables"]["documents"]["Row"]> | null>(null)
  const [pagesLoading, pagesLoadingSetter] = useState<boolean>(true)

  useEffect(() => {
    const loadHandler = async () => {
      const { data, error } = await supabase.from("documents").select()

      if (!error) {
        pagesSetter(data)
      }

      pagesLoadingSetter(false)
    }

    loadHandler()
  }, [])

  const onPageCardClick = (pageId: number) => {
    router.push(`/documents/${pageId}`)
  }

  const onNewPageCardClick = () => {
    router.push("/documents/new")
  }

  return (
    <>
      <Grid container spacing={2} sx={{ marginTop: 2, paddingX: 4 }}>
        <Grid item xs={4}>
          <PageCard
            title="New Page"
            description="Click here to create a new page"
            onClick={() => onNewPageCardClick()}
            styles={{
              backgroundColor: new Color("#16448050"),
            }}
          />
        </Grid>
        {pagesLoading ? (
          <Skeleton variant="text" />
        ) : pages ? (
          // create card for each page
          pages.map((page, i) => (
            <Grid item key={i} xs={4}>
              <PageCard
                title={page.title}
                description={page.text}
                onClick={() => onPageCardClick(page.id)}
                styles={{
                  backgroundColor: new Color("#242424"),
                }}
              />
            </Grid>
          ))
        ) : (
          // error card
          <Typography variant="h1">Failed to load your documents.</Typography>
        )}
      </Grid>
    </>
  )
}

export default DocumentsPage
