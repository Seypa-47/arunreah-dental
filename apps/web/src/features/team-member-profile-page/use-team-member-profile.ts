import { useQuery } from '@tanstack/react-query';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { getPublicDoctor, getPublicDoctors } from '@/services/public-content';
import { findTeamMemberProfile } from '@/features/doctors-page/team-directory';

export function useTeamMemberProfileQuery(slug: string | undefined) {
  const { language } = usePublicLanguage();
  return useQuery({
    enabled: Boolean(slug),
    queryFn: async () => {
      const [detail, team] = await Promise.all([
        getPublicDoctor(slug!, language),
        getPublicDoctors(language),
      ]);
      return findTeamMemberProfile(slug, detail.doctor, team.doctors, language);
    },
    queryKey: queryKeys.public.teamMember(slug ?? '', language),
  });
}
