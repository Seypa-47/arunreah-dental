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
    email: {
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
    email: {
      label: 'Email address',
      placeholder: 'Enter your email address',
    },
  },
  footer: `© ${new Date().getFullYear()} Arunreah Dental Clinic. All rights reserved.`,
  form: {
    errorMessage: 'Invalid email or password',
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
