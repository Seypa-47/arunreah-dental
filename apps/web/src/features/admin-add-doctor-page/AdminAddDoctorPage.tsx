import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { TeamCategory } from '@arunreah/shared';
import { AdminPageHeading } from '@/components/layout/admin-workspace';
import { TeamMemberForm, emptyTeamMember } from '@/features/admin-doctors-page/TeamMemberForm';
import { isTeamCategory } from '@/features/admin-doctors-page/team-workspace';
import { sanitizeDoctorCreatePayload } from '@/features/admin-doctors-page/doctor-payload';
import type { AdminDoctor } from '@/services/admin-doctors';
import { cmsApi } from '@/services/cms';
import { invalidateCmsDomain } from '@/services/cms-cache';

export function AdminAddDoctorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const categoryParam = searchParams.get('category');
  const category: TeamCategory = isTeamCategory(categoryParam) ? categoryParam : 'DENTIST';
  const initialValue = useMemo(() => emptyTeamMember(category), [category]);
  const [saved, setSaved] = useState(false);
  const createMutation = useMutation({
    mutationFn: (doctor: AdminDoctor) => cmsApi.doctors.create(sanitizeDoctorCreatePayload(doctor)),
    onSuccess: async () => {
      setSaved(true);
      await invalidateCmsDomain(queryClient, 'doctors');
      window.setTimeout(() => navigate(`/admin/team?category=${category}`), 700);
    },
  });

  return <main className="min-w-0 flex-1 bg-[#f6f8fb] px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-8"><AdminPageHeading /></header>
      <TeamMemberForm
        initialValue={initialValue}
        mode="create"
        onCancel={() => navigate(`/admin/team${category === 'DENTIST' ? '' : `?category=${category}`}`)}
        onSubmit={(doctor) => createMutation.mutate(doctor)}
        saveError={createMutation.error instanceof Error ? createMutation.error.message : createMutation.isError ? 'Please review the form and try again.' : null}
        saveSuccess={saved}
        saving={createMutation.isPending}
      />
    </div>
  </main>;
}
