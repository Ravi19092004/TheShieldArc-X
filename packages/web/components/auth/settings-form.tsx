// packages/web/components/auth/settings-form.tsx
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { SettingsSchema } from "@/src/schemas";
import { CardWrapper } from "@/components/auth/card-wrapper";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { updateSettings } from "@/src/actions/settings";
import { Session } from "next-auth";

interface SettingsFormProps {
    user?: Session["user"];
}

export const SettingsForm = ({ user }: SettingsFormProps) => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof SettingsSchema>>({
        resolver: zodResolver(SettingsSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            updateSettings(values)
                .then((data) => {
                    setError(data.error);
                    setSuccess(data.success);
                })
                .catch(() => setError("Something went wrong!"));
        });
    };

    return (
        <CardWrapper
            headerLabel="Dashboard"
            backButtonLabel="Back to safety"
            backButtonHref="/"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="John Doe"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="john.doe@example.com"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="********"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error || ""} />
                    <FormSuccess message={success || ""} />
                    <div className="flex gap-x-4">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            Update Profile
                        </Button>
                        <Button type="button" className="w-full" variant="outline" onClick={() => router.push('/dashboard/settings/scan-history')}>
                            Scan History
                        </Button>
                    </div>
                </form>
            </Form>
        </CardWrapper>
    );
};
