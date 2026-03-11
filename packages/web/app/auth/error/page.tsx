// packages/web/app/auth/error/page.tsx
import { ErrorCard } from "@/components/auth/error-card";

const AuthErrorPage = async ({ searchParams }: { searchParams: Promise<{ error?: string; error_description?: string; provider?: string }> }) => {
    const params = await searchParams;
    const error = params.error;
    const errorDescription = params.error_description;
    const provider = params.provider;

    return (
        <ErrorCard error={error} errorDescription={errorDescription} provider={provider} />
    );
};

export default AuthErrorPage;
