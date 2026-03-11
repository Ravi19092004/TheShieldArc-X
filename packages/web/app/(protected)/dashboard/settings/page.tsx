import { auth } from "@/auth";
import { SettingsForm } from "@/components/auth/settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = async () => {
  const session = await auth();
  const user = session?.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <SettingsForm user={user} />
      </CardContent>
    </Card>
  );
};

export default SettingsPage;