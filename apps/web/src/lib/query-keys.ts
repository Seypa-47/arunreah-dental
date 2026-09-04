export const queryKeys = {
  health: () => ['health'] as const,
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  dashboard: () => ['admin', 'dashboard'] as const,
  public: {
    branches: (language: 'en' | 'km') => ['public', 'branches', language] as const,
    branch: (slug: string, language: 'en' | 'km') =>
      ['public', 'branches', slug, language] as const,
    clinic: () => ['public', 'clinic'] as const,
    contact: () => ['public', 'contact'] as const,
    doctor: (slug: string, language: 'en' | 'km') =>
      ['public', 'doctors', slug, language] as const,
    doctors: (language: 'en' | 'km') => ['public', 'doctors', language] as const,
    service: (slug: string, language: 'en' | 'km') =>
      ['public', 'services', slug, language] as const,
    services: (language: 'en' | 'km') => ['public', 'services', language] as const,
    showcase: (slug: string, language: 'en' | 'km') =>
      ['public', 'showcases', slug, language] as const,
    showcases: (language: 'en' | 'km', homepageOnly = false) =>
      ['public', 'showcases', language, { homepageOnly }] as const,
  },
  admin: {
    appointments: (filters: Record<string, string | number | boolean | undefined> = {}) =>
      ['admin', 'appointments', filters] as const,
    appointment: (id: string) => ['admin', 'appointments', id] as const,
    branches: (filters: Record<string, string | number | boolean | undefined> = {}) =>
      ['admin', 'branches', filters] as const,
    branch: (id: string) => ['admin', 'branches', id] as const,
    clinic: () => ['admin', 'clinic'] as const,
    contact: () => ['admin', 'contact'] as const,
    doctors: (filters: Record<string, string | number | boolean | undefined> = {}) =>
      ['admin', 'doctors', filters] as const,
    doctor: (id: string) => ['admin', 'doctors', id] as const,
    services: (filters: Record<string, string | number | boolean | undefined> = {}) =>
      ['admin', 'services', filters] as const,
    service: (id: string) => ['admin', 'services', id] as const,
    showcases: (filters: Record<string, string | number | boolean | undefined> = {}) =>
      ['admin', 'showcases', filters] as const,
    showcase: (id: string) => ['admin', 'showcases', id] as const,
  },
} as const;
