import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminAddShowcaseContent,
  saveShowcaseArticle,
  type NewShowcaseFormState,
} from '@/services/admin-add-showcase';

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
      void queryClient.invalidateQueries({ queryKey: ['admin-showcase-page'] });
    },
  });
}

