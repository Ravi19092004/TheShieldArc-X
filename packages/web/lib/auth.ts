import { login } from "@/src/actions/login";
import { register } from "@/src/actions/register";

export const authService = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const result = await login({ email, password });
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  },
  register: async ({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }) => {
    const result = await register({
      name: username,
      email,
      password,
      terms: true,
    });
    if (result.error) {
      throw new Error(result.error);
    }
  },
};
