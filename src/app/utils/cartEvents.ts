export const CART_UPDATED_EVENT = "subli:cart-updated"

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}
