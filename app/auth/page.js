import AuthScreen from "@/components/auth/AuthScreen";

export const metadata = {
  title: "Nirbhor - Login & Registration | নির্ভর",
  description: "Login or register to Nirbhor verified services platform",
};

export default function AuthPage() {
  return <AuthScreen initialMode="login" />;
}

