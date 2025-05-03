import { GalleryVerticalEnd } from "lucide-react";
import { RegisterForm } from "@/components/RegisterForm";
import image from "../assets/registerImage.jpg";
import { usePasswordContext } from "@/data/PasswordContext";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function RegisterPage() {
  const {addUser} = usePasswordContext();
  const SITE_KEY = "6LdROCgrAAAAAEkl7izkHo6eb4Fesdq2E37OkstI";
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
            <GoogleReCaptchaProvider
                        reCaptchaKey={SITE_KEY}
                        scriptProps={{
                          async: true,
                          defer: true,
                          appendTo: "head",
                          nonce: undefined,
                        }}>
            <RegisterForm addUser={addUser}/>
            </GoogleReCaptchaProvider>
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
  );
}