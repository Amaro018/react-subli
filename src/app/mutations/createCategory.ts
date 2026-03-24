import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateCategory = z.object({
  name: z.string().min(1, "Category name cannot be empty."),
})

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

export default resolver.pipe(resolver.zod(CreateCategory), resolver.authorize(), async (input) => {
  const slug = slugify(input.name)
  const category = await db.category.create({ data: { ...input, slug } })
  return category
})
