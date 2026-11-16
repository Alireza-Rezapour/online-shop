import { ProfileView } from "../components/profile/profile-view";

export default function ProfilePage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-foreground">
          اطلاعات پروفایل
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          میتوانید اطلاعات پروفایل خود را ویرایش کنید.
        </p>
      </div>
      <ProfileView />
    </div>
  );
}
