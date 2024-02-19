// Add a new note to a document

import { newNoteAPISchema, noteSelectedWordsRange } from "@/app/schemas/notes"
import { colorToAlphaHex, tryStuff } from "@/app/utility/gen"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { z } from "zod"

type NoteSelectedRange = z.infer<typeof noteSelectedWordsRange>

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // get the request body
  const requestBody = await request.json()

  // TODO: auth

  // validate the incoming data
  const [validData, validationError] = tryStuff(newNoteAPISchema.parse, requestBody)

  if (validationError) {
    return Response.json(
      {
        errors: [{ message: "Invalid Data" }],
      },
      { status: 400 }
    )
  }

  const userResponse = await supabase.auth.getUser()

  if (userResponse.error) {
    return Response.json(
      {
        errors: [{ message: "Could not determine who is trying to add a note. Are you authenticated?" }],
      },
      { status: 401 }
    )
  }

  // create new note
  const newNoteDatabaseResult = await supabase
    .from("notes")
    .insert({
      owner_id: userResponse.data.user.id,
      document_id: validData.documentId,
      hex_bg_color: colorToAlphaHex(validData.noteColor),
    })
    .select()

  switch (newNoteDatabaseResult.status) {
    case 201:
      if (newNoteDatabaseResult.error) {
        return Response.json(
          {
            errors: [{ message: "Failed to create new note record" }],
          },
          { status: 500 }
        )
      }

      // add the ranges to the database

      const rangesFailedToBeAdded: Array<NoteSelectedRange> = []

      for (let i = 0; i < validData.ranges.length; i++) {
        const range = validData.ranges.at(i)

        if (!range) continue

        const rangeDatabaseResult = await supabase.from("note_selected_ranges").insert({
          note_id: newNoteDatabaseResult.data.at(0)?.id,
          start_word_index: range.startWordIndex,
          end_word_index: range.endWordIndex,
        })

        switch (rangeDatabaseResult.status) {
          case 201:
            break
          default:
            // not 201 - so something went wrong
            rangesFailedToBeAdded.push(range)
        }
      }

      const rangeAddingErrorResponseObjects = rangesFailedToBeAdded.map((range) => ({
        message: `Failed to add the selected range from word ${range.startWordIndex} to word ${range.endWordIndex}`,
      }))

      return Response.json(
        {
          data: {
            newNote: newNoteDatabaseResult.data.at(0),
          },
          errors: rangeAddingErrorResponseObjects ?? undefined,
        },
        {
          status: 201,
        }
      )

    default:
      return Response.json(
        {
          errors: [{ message: "Failed to create new note record" }],
        },
        { status: 500 }
      )
  }
}
