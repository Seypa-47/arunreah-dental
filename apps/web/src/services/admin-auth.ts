export type AdminLoginContent = {
  brand: {
    logoAlt: string;
    logoUrl: string;
    portalLabel: string;
    title: string;
  };
  fields: {
    password: {
      label: string;
      placeholder: string;
    };
    username: {
      label: string;
      placeholder: string;
    };
  };
  footer: string;
  form: {
    errorMessage: string;
    forgotPasswordLabel: string;
    forgotPasswordUrl: string;
    submitLabel: string;
    subtitle: string;
    title: string;
  };
  security: {
    encryptionLabel: string;
    sslLabel: string;
    verifiedLabel: string;
  };
};

const adminLoginContent: AdminLoginContent = {
  brand: {
    logoAlt: 'Arunreah Dental Clinic',
    logoUrl: '/assets/landing/footer-logo-cropped.png',
    portalLabel: 'Admin Management Portal',
    title: 'Arunreah Dental Clinic',
  },
  fields: {
    password: {
      label: 'Password',
      placeholder: 'Enter your password',
    },
    username: {
      label: 'Username or Email',
      placeholder: 'Enter your username or email',
    },
  },
  footer: `© ${new Date().getFullYear()} Arunreah Dental Clinic. All rights reserved.`,
  form: {
    errorMessage: 'Invalid username or password',
    forgotPasswordLabel: 'Forgot password?',
    forgotPasswordUrl: 'mailto:info@arunreahclinic.com?subject=Admin%20password%20reset',
    submitLabel: 'Log In',
    subtitle: 'Please enter your details to sign in.',
    title: 'Welcome Back',
  },
  security: {
    encryptionLabel: '256-bit Encryption',
    sslLabel: 'SSL Secured',
    verifiedLabel: 'Security Verified',
  },
};

export async function fetchAdminLoginContent(): Promise<AdminLoginContent> {
  return adminLoginContent;
}

export async function submitAdminLogin(_credentials: { password: string; username: string }): Promise<void> {
  // Authentication will be connected to the clinic's admin API when it is available.
  void _credentials;
  throw new Error('ADMIN_LOGIN_UNAVAILABLE');
}
