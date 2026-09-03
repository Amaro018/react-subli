import { useAuthenticatedBlitzContext } from "../blitz-server"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  await useAuthenticatedBlitzContext({
    redirectAuthenticatedTo: "/",
  })
  return <>{children}</>
}
