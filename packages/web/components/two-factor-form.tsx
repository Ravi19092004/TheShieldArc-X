"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useState, useTransition } from "react";
import { verifyTwoFactor } from "@/src/actions/two-factor";
import { resendTwoFactor } from "@/src/actions/two-factor";

const TwoFactorSchema = z.object({
    code: z.string().min(6, { message: "Code must be 6 digits" }),
});

export const TwoFactorForm = ({ userId }: { userId?: string }) => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [isResendPending, startResendTransition] = useTransition();

    const form = useForm<z.infer<typeof TwoFactorSchema>>({
        resolver: zodResolver(TwoFactorSchema),
        defaultValues: { code: "" },
    });

    const onSubmit = (values: z.infer<typeof TwoFactorSchema>) => {
        setError("");
        setSuccess("");
        startTransition(() => {
            verifyTwoFactor(values.code, userId).then((data: { error?: string }) => {
                if (data?.error) {
                    setError(data.error);
                }
                // On success, signIn redirects
            });
        });
    };

    const onResend = () => {
        setError("");
        setSuccess("");
        startResendTransition(() => {
            resendTwoFactor(userId).then((data: { error?: string; success?: string }) => {
                setError(data.error);
                setSuccess(data.success);
            });
        });
    };

    return (
        <CardWrapper
            headerLabel="Two-Factor Authentication"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Enter the 6-digit code sent to your email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="123456"
                                            className="bg-black/20 border-neon/30 placeholder:text-neon/40 focus-visible:ring-neon"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error ?? ""} />
                    <FormSuccess message={success ?? ""} />
                    <Button disabled={isPending} type="submit" className="w-full">
                        Verify
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onResend}
                        disabled={isResendPending}
                        className="w-full"
                    >
                        Resend Code
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
