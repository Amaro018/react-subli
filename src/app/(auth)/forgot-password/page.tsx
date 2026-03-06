import { ForgotPasswordForm } from "../components/ForgotPasswordForm"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar currentUser={null} />
      <div className="flex flex-grow items-center justify-center p-4">
        <ForgotPasswordForm />
      </div>
      <Footer />
    </main>
  )
}
