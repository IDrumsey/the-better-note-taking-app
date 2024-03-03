import { z } from "zod"

export const userIdValidator = z.number().int().nonnegative()
