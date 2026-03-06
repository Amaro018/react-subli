import { ResetPasswordForm } from "../components/ResetPasswordForm"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar currentUser={null} />
      <div className="flex flex-grow items-center justify-center p-4">
        <ResetPasswordForm />
      </div>
      <Footer />
    </main>
  )
}
