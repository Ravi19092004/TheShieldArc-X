import { Social } from "@/components/auth/social";

interface SocialLoginButtonsProps {
  mode: "login" | "register";
}

const SocialLoginButtons = ({}: SocialLoginButtonsProps) => {
  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <Social />
      </div>
    </div>
  );
};

export default SocialLoginButtons;
