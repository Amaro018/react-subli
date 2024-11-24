import Navbar from "../../components/Navbar"
import { SignupForm } from "../components/SignupForm"
import Footer from "../../components/Footer"
export default function SignUpPage() {
  return (
    <>
      <Navbar currentUser={null} />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <SignupForm />
      </div>
      <Footer />
    </>
  )
}
