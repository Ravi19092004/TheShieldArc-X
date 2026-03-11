"use client"

import { useEffect, useState } from "react"
import { Camera, Lock, Mail, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { Navigation } from "@/components/Navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserProfile {
  username: string
  email: string
  profilePicture: string
  joinedDate: Date
}

const Profile = () => {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<Partial<UserProfile>>({})
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (session?.user) {
      const user = session.user
      const profileData = {
        username: user.name ?? "",
        email: user.email ?? "",
        profilePicture: user.image ?? "",
        // 'joinedDate' is not standard in session, so we'll use a placeholder or you can add it to your session callback
        joinedDate: new Date(), // Or fetch from your backend if available
      }
      setProfile(profileData)
      setUsername(profileData.username)
      setEmail(profileData.email)
    }
  }, [session])

  const handleProfileUpdate = async () => {
    // Here you would call your API to update the profile
    // For now, we'll just update the session locally for optimistic UI
    await update({ name: username, email })
    setProfile((prev) => ({ ...prev, username, email }))
    setIsEditingProfile(false)
    toast.success("Profile updated successfully!")
  }

  const handlePasswordUpdate = () => {
    // Here you would call your API to update the password
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    setIsEditingPassword(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    toast.success("Password updated successfully!")
  }

  const handleImageUpload = () => {
    // Here you would implement the logic to upload an image to your backend/storage
    toast.info("Image upload would be implemented here")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 bg-gradient-cyber bg-clip-text text-3xl font-bold text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and security settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="animate-fade-in border-border bg-card shadow-glow-cyan">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={profile.profilePicture} alt={profile.username || "User"} />
                  <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                    {profile.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" onClick={handleImageUpload}>
                    <Camera className="mr-2 h-4 w-4" />
                    Upload New Picture
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card
            className="animate-fade-in border-border bg-card"
            style={{ animationDelay: "100ms" }}
          >
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditingProfile}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditingProfile}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {isEditingProfile ? (
                  <>
                    <Button variant="cyber" onClick={handleProfileUpdate}>
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card
            className="animate-fade-in border-border bg-card"
            style={{ animationDelay: "200ms" }}
          >
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingPassword ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="cyber" onClick={handlePasswordUpdate}>
                      Update Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingPassword(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditingPassword(true)}
                >
                  Change Password
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card
            className="animate-fade-in border-0 bg-gradient-cyber shadow-glow-purple"
            style={{ animationDelay: "300ms" }}
          >
            <CardHeader>
              <CardTitle className="text-foreground">Account Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-foreground">
                <div>
                  <p className="text-sm opacity-80">Member Since</p>
                  <p className="text-lg font-semibold">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      year: "numeric"
                    }).format(profile.joinedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Account Status</p>
                  <p className="text-lg font-semibold">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile