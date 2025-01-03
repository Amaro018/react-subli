import Navbar from "../../components/Navbar"
import { SignupForm } from "../components/SignupForm"
import Footer from "../../components/Footer"
export default function SignUpPage() {
  return (
    <>
    <div className="flex flex-col">
    <div className="relative mb-16">

      <Navbar currentUser={null} />
      </div>
      <div className="flex flex-col items-center justify-center h-full my-16">
        <SignupForm />
      </div>
      <Footer />
      </div>
    </>
  )
}
