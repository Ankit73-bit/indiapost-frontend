import { Loader2, KeyRound, User } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminEditNameForm } from '@/components/profile/AdminEditNameForm';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileInfoStrip } from '@/components/profile/ProfileInfoStrip';
import { SelfNameForm } from '@/components/profile/SelfNameForm';
import { SelfPasswordForm } from '@/components/profile/SelfPasswordForm';
import { useProfilePage } from '@/pages/profile/useProfilePage';

export function ProfilePage() {
  const { editUserId, isEditingOther, profile, isLoading, clientName } = useProfilePage();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title={isEditingOther ? `Edit User — ${profile?.name ?? profile?.email}` : 'My Profile'}
        description={
          isEditingOther
            ? 'Admin editing user profile.'
            : 'Manage your account details and security.'
        }
      />

      <ProfileInfoStrip
        email={profile?.email}
        role={profile?.role}
        clientName={clientName}
      />

      <ProfileCard icon={User} title="Display Name">
        {isEditingOther ? (
          <AdminEditNameForm userId={editUserId!} initialName={profile?.name} />
        ) : (
          <SelfNameForm initialName={profile?.name} />
        )}
      </ProfileCard>

      {!isEditingOther && (
        <ProfileCard icon={KeyRound} title="Change Password">
          <SelfPasswordForm />
        </ProfileCard>
      )}
    </div>
  );
}
