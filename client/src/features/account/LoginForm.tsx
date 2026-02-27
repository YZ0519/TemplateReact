import { useForm } from "react-hook-form";
import { useAccount } from "../../lib/hooks/useAccount";
import { loginSchema } from "../../lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import TextInput from "../../app/shared/components/TextInput";
import { Link, useLocation, useNavigate } from "react-router";

export default function LoginForm() {
  const { loginUser } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<loginSchema>({
    mode: "onTouched",
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: loginSchema) => {
    await loginUser.mutateAsync(data, {
      onSuccess: () => {
        navigate(location.state?.from || "/");
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 p-6 max-w-md mx-auto bg-white shadow rounded-lg"
    >
      <div className="flex items-center justify-center gap-3 text-purple-600">
        <Lock size={28} />
        <h2 className="text-2xl font-bold">Sign In</h2>
      </div>

      <TextInput label="Email" control={control} name="email" />
      <TextInput label="Password" type="password" control={control} name="password" />

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline ml-1">
          Sign Up
        </Link>
      </p>
      <Link
        to="/"
        className="text-center text-sm text-blue-600 hover:underline"
      >
        Get started
      </Link>
    </form>
  );
}
