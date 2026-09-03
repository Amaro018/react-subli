import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import FormShopRegister from "./FormShopRegister"

const push = vi.fn()
const replace = vi.fn()
const refresh = vi.fn()
const createShopMutation = vi.fn().mockResolvedValue({})

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace, refresh }),
}))

vi.mock("@blitzjs/rpc", () => ({
  useMutation: () => [createShopMutation],
  useQuery: () => [[], undefined],
  invalidateQuery: vi.fn(),
}))

vi.mock("../../mutations/uploadShopBg", () => ({
  default: vi.fn(),
}))

vi.mock("../../queries/getBarangays", () => ({
  default: vi.fn(),
}))

vi.mock("../../users/queries/getCurrentUser", () => ({
  default: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}))

describe("FormShopRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects to the pending shop page after a successful registration", async () => {
    render(<FormShopRegister currentUser={{ id: 1, isShopRegistered: false, isShopMode: false }} />)

    fireEvent.change(screen.getByLabelText(/shop name/i), {
      target: { value: "Test Shop" },
    })
    fireEvent.change(screen.getByLabelText(/shop email/i), {
      target: { value: "shop@example.com" },
    })
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "This is a sample description" },
    })
    fireEvent.change(screen.getByLabelText(/street address/i), {
      target: { value: "123 Main St" },
    })
    fireEvent.click(screen.getByRole("button", { name: /next step/i }))

    const dtiInput = document.querySelector('input[name="documentDTI"]') as HTMLInputElement
    const permitInput = document.querySelector('input[name="documentPermit"]') as HTMLInputElement
    const taxInput = document.querySelector('input[name="documentTax"]') as HTMLInputElement

    fireEvent.change(dtiInput, {
      target: { files: [new File(["dti"], "dti.pdf", { type: "application/pdf" })] },
    })
    fireEvent.change(permitInput, {
      target: { files: [new File(["permit"], "permit.pdf", { type: "application/pdf" })] },
    })
    fireEvent.change(taxInput, {
      target: { files: [new File(["tax"], "tax.pdf", { type: "application/pdf" })] },
    })

    fireEvent.click(screen.getByRole("button", { name: /next step/i }))
    fireEvent.click(screen.getByRole("button", { name: /submit registration/i }))

    await waitFor(() => {
      expect(createShopMutation).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/renter/my-shop/pending")
    })
  })
})
