import Navbar from "../../components/Navbar"
import { SignupForm } from "../components/SignupForm"
import Footer from "../../components/Footer"

export default function SignUpPage() {
  return (
    <main className="flex h-screen flex-col overflow-y-auto scrollbar-seamless">
      <Navbar currentUser={null} />
      <div className="flex flex-grow items-center justify-center p-4">
        <SignupForm />
      </div>
      <Footer />
    </main>
  )
}
