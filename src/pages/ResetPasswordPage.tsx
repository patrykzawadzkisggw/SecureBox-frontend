import { useParams } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";


const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hasła muszą się zgadzać",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const { id: resetToken } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidToken = (token: string) => {
    const regex = /^[a-f0-9]{64}$/;
    return regex.test(token);
  };

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsTokenExpired(false); 

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/reset-password/confirm`,
        {
          resetToken,
          newPassword: data.newPassword,
        }
      );

      if (response.status === 200) {
        setIsSuccess(true);
        console.log("Hasło zostało zaktualizowane pomyślnie.");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = error.response.data.error || "Wystąpił błąd podczas zmiany hasła";

        if (status === 401) {
          setIsTokenExpired(true);
        } else {
          setErrorMessage(message); 
        }
      } else {
        setErrorMessage("Wystąpił nieoczekiwany błąd");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!resetToken || !isValidToken(resetToken)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500 text-lg">Invalid or missing token</div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">Sukces!</h2>
          <p className="text-gray-700">Hasło zostało pomyślnie zmienione.</p>
          <Button
            variant="link"
            className="mt-4"
            onClick={() => window.location.href = "/login"}
          >
            Przejdź do logowania
          </Button>
        </div>
      </div>
    );
  }

  if (isTokenExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Błąd</h2>
          <p className="text-gray-700">Token resetu hasła wygasł lub został już użyty.</p>
          <Button
            variant="link"
            className="mt-4"
            onClick={() => window.location.href = "/"}
          >
            Strona główna
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Zmień hasło</h2>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nowe hasło</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Wprowadź nowe hasło"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potwierdź hasło</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Potwierdź nowe hasło"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Zmieniam..." : "Zmień hasło"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};