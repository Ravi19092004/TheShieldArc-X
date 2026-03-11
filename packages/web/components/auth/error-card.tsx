import { CardWrapper } from "./card-wrapper";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface ErrorCardProps {
    error?: string;
    errorDescription?: string;
    provider?: string;
}

export const ErrorCard = ({ error, errorDescription, provider }: ErrorCardProps) => {
    return (
        <CardWrapper headerLabel="Oops! Something went wrong" backButtonHref="/auth/login" backButtonLabel="Back to login">
            <div className="w-full flex items-center justify-center">
                <ExclamationTriangleIcon className="text-destructive" />
            </div>
            {error && (
                <div className="mt-4 text-center text-sm text-destructive">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}
            {errorDescription && (
                <div className="mt-2 text-center text-sm text-muted-foreground">
                    <p>{errorDescription}</p>
                </div>
            )}
            {provider && (
                <div className="mt-2 text-center text-sm text-muted-foreground">
                    <p><strong>Provider:</strong> {provider}</p>
                </div>
            )}
        </CardWrapper>
    );
}
