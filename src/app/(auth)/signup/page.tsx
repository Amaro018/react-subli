import Navbar from "../../components/Navbar"
import { SignupForm } from "../components/SignupForm"
import Footer from "../../components/Footer"

export default function SignUpPage() {
  return (
    <main className="flex h-screen flex-col overflow-y-auto scrollbar-seamless bg-gray-50">
      <Navbar currentUser={null} />
      <div className="mx-auto flex w-full max-w-[1400px] flex-grow items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <SignupForm />
      </div>
      <Footer />
    </main>
  )
}
