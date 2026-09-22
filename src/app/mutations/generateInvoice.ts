import { resolver } from "@blitzjs/rpc"
import z from "zod"
import { recalculateInvoiceByRentId } from "@/src/app/(pages)/invoice/utils/recalculateInvoice"

const GenerateInvoice = z.object({
  rentId: z.number(),
})

export default resolver.pipe(
  resolver.zod(GenerateInvoice),
  resolver.authorize(),
  async ({ rentId }) => {
    return await recalculateInvoiceByRentId(rentId)
  }
)
