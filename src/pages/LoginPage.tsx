import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import image from "../assets/loginImage.jpg"
import { usePasswordContext } from "@/data/PasswordContext"
import { resetPasswordSubmit } from "@/lib/fn2"
export default function LoginPage() {
  const {login} = usePasswordContext()
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <span className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            SecureBox
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm loginUser={login} resetPasswordSubmit={resetPasswordSubmit}/>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={image}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
