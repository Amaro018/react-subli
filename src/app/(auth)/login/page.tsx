import { LoginForm } from "../components/LoginForm"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar currentUser={null} />
      <div className="flex flex-grow items-center justify-center p-8">
        <LoginForm />
      </div>
      <Footer />
    </div>
  )
}
