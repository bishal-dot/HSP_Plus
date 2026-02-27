import type { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title:
    "INF NEPAL MEDISOFT",
  description: "This is Page manages the login of the application.",
};

export default function SignIn() {
  return <SignInForm />;
}
