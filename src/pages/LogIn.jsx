import { LoginForm } from "@/components/auth/LoginForm";
import AppLogo from "@/components/layout/AppLogo"

export default function LogIn() {
  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center">
          <AppLogo />
        </div>
        <div className="flex flex-1 items-start my-10 justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
