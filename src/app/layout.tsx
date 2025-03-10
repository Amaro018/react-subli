import "./styles/globals.css"
import { BlitzProvider } from "./blitz-client"
import { Inter } from "next/font/google"
import Footer from "./components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: { title: "New Blitz App", template: "%s – Blitz" },
  description: "Generated by blitz new ",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BlitzProvider>
          <>
            <main className="h-[100vh]">{children}</main>
          </>
        </BlitzProvider>
        {/* <div className="w-full relative">
          <div className="absolute bottom-0 w-full">
            <Footer />
          </div>
        </div> */}
      </body>
    </html>
  )
}
