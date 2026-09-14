import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminAddShowcaseContent,
  saveShowcaseArticle,
  type NewShowcaseFormState,
} from '@/services/admin-add-showcase';
import { invalidateCmsDomain } from '@/services/cms-cache';

export function useAdminAddShowcasePageQuery() {
  return useQuery({
    queryFn: fetchAdminAddShowcaseContent,
    queryKey: ['admin-add-showcase-page'],
  });
}

export function useCreateShowcaseArticleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: NewShowcaseFormState) => saveShowcaseArticle(formData),
    onSuccess: () => {
      void invalidateCmsDomain(queryClient, 'showcases');
    },
  });
}
