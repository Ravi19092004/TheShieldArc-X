"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Camera, User, Mail, Trash2, Power } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define Zod schema for validation
const ProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional().or(z.literal("")),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }).optional().or(z.literal("")),
  confirmNewPassword: z.string().optional().or(z.literal("")),
  avatar: z.any().optional(),
  mfaEnabled: z.boolean().default(false),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return !data.newPassword || data.newPassword === data.confirmNewPassword;
}, {
  message: "New passwords must match.",
  path: ["confirmNewPassword"],
});

interface UpdateProfileProps {
  onBack: () => void;
}

const UpdateProfilePage = ({ onBack }: UpdateProfileProps) => {
  const { data: session, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      mfaEnabled: false,
    },
  });

  useEffect(() => {
    if (session?.user?.image) {
      setAvatarPreview(session.user.image);
    }
  }, [session?.user?.image]);

  useEffect(() => {
    if (session?.user) {
      form.setValue('name', session.user.name || "");
      form.setValue('email', session.user.email || "");
      // mfaEnabled can be set if available
    }
  }, [session?.user, form]);

  const onSubmit = async (values: z.infer<typeof ProfileSchema>) => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // This part handles name, email, and avatar updates.
    // Password and MFA changes should be handled in separate functions.
    // I've left the logic here for now as a combined submission.
    // In a real app, you might have separate buttons and API endpoints.

    const formData = new FormData();
    formData.append("name", values.name || "");
    formData.append("email", values.email || "");
    if (values.avatar && values.avatar.length > 0) {
      formData.append("avatar", values.avatar[0]);
    }

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Profile updated successfully!");
        setSuccess(data.message || "Profile updated successfully!");
        // Trigger a session update to refresh user data across the app
        await update(true);
      } else {
        toast.error(data.error || "Failed to update profile.");
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("An unexpected error occurred.");
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="space-y-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-2xl font-bold">Profile Settings</span>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardTitle>
        <CardDescription>
          Manage your account information and security settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          <Card className="bg-card/50 border-border">
            <CardHeader><CardTitle>Profile Picture</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={avatarPreview || session?.user?.image || ""} alt={session?.user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="mr-2 h-4 w-4" />
                            Upload New Picture
                          </Button>
                        </FormControl>
                        <Input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          ref={(el) => {
                            field.ref(el);
                            fileInputRef.current = el;
                          }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(e.target.files);
                              setAvatarPreview(URL.createObjectURL(file));
                            }
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div></CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader><CardTitle>User Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...field} placeholder="Your Name" className="pl-10" />
                      </div>
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
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...field} type="email" placeholder="your@email.com" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="********" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="********" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="********" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="mfaEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Two-Factor Authentication</FormLabel>
                      <CardDescription>
                        Enhance your account security with an extra layer of protection.
                      </CardDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader><CardTitle className="text-destructive">Account Management</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="destructive" type="button"><Trash2 className="mr-2 h-4 w-4" /> Delete Account</Button>
              <Button variant="outline" type="button"><Power className="mr-2 h-4 w-4" /> Logout from All Devices</Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <FormError message={error ?? ""} />
            <FormSuccess message={success ?? ""} />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="submit" variant="neon" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save All Changes"}
            </Button>
          </div>

          </form>
        </Form>
      </CardContent>
    </div>
  );
};

export default UpdateProfilePage;