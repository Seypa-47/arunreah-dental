import type {
  DoctorDetailContent,
  DoctorsPageContent,
  LandingDoctor,
  LandingPageContent,
  LandingNavigationItem,
} from '@/features/landing-page/types';

function doctorDetail({
  education,
  experience = 'Full profile information will be updated soon.',
  pageDescription,
  profileHref,
  services,
}: {
  education: string[];
  experience?: string;
  pageDescription: string;
  profileHref: string;
  services: string[];
}): LandingDoctor['detail'] {
  return {
    biography:
      'Full doctor biography and consultation information will be updated when the clinic provides the final profile content.',
    education,
    experience,
    languages: ['English', 'Khmer'],
    pageDescription,
    profileHref,
    services,
  };
}

const doctorProfiles: LandingDoctor[] = [
  {
    bookingLabel: 'Book with Asst.Prof. Heng',
    credential: 'DDS, 25+ YEARS EXPERIENCE',
    detail: doctorDetail({
      education: ['DDS', 'Certificate of Implant'],
      experience: '25+ years of dental experience with advanced implant care.',
      pageDescription: 'Implant specialist with 25+ years of dental experience.',
      profileHref: '/doctors/sreng-heng',
      services: ['Implant Dentistry'],
    }),
    focus: 'Implant Specialist',
    imageAlt: 'Portrait of Asst.Prof. Sreng Heng',
    imageUrl: '/assets/landing/doctor-sreng-heng.jpg',
    name: 'Asst.Prof. Sreng Heng',
    specialty: 'Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Sontary',
    credential: 'DDS, POS',
    detail: doctorDetail({
      education: ['DDS', 'Progressive Orthodontics Seminars POS', 'Certificate of Implant', 'Member of ICCDE'],
      pageDescription: 'Orthodontics and implant dentistry specialist.',
      profileHref: '/doctors/chho-sonthary',
      services: ['Orthodontics', 'Implant Dentistry'],
    }),
    focus: 'ICCDE Member',
    imageAlt: 'Portrait of Dr. Chho Sonthary',
    imageUrl: '/assets/landing/doctor-chho-sontary.jpg',
    name: 'Dr. Chho Sonthary',
    specialty: 'Orthodontics & Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Delux',
    credential: 'M.SC. ORTHODONTICS',
    detail: doctorDetail({
      education: ['M.Sc. Orthodontics', 'Progressive Orthodontics Seminars POS', 'DDS'],
      pageDescription: 'Orthodontics specialist trained in Germany.',
      profileHref: '/doctors/yim-delux',
      services: ['Orthodontics'],
    }),
    focus: 'Orthodontics Specialist (Germany)',
    imageAlt: 'Portrait of Dr. Yim Delux',
    imageUrl: '/assets/landing/doctor-yim-delux-new.jpg',
    name: 'Dr. Yim Delux',
    specialty: 'Orthodontics',
  },
  {
    bookingLabel: 'Book with Dr. Kunthy',
    credential: 'DDS, DIPLOMA IN IMPLANTOLOGY',
    detail: doctorDetail({
      education: ['DDS', 'Certificate of Implant', 'Diploma of Implant, Frankfurt University Germany'],
      pageDescription: 'Implantology specialist trained in Germany.',
      profileHref: '/doctors/chuong-kunthy',
      services: ['Implant Dentistry'],
    }),
    focus: 'Implantology Specialist (Germany)',
    imageAlt: 'Portrait of Dr. Chuong Kunthy',
    imageUrl: '/assets/landing/doctor-chuong-kunthy.jpg',
    name: 'Dr. Chuong Kunthy',
    specialty: 'Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Thanith',
    credential: 'DDS',
    detail: doctorDetail({
      education: ['DDS', 'Diploma of Digital Smile', 'Certificate of Implant'],
      pageDescription: 'Digital smile design and implant dentistry care.',
      profileHref: '/doctors/taing-thanith',
      services: ['Digital Smile Design', 'Implant Dentistry'],
    }),
    focus: 'Digital Smile Design',
    imageAlt: 'Portrait of Dr. Taing Thanith',
    imageUrl: '/assets/landing/doctor-taing-thanith-new.jpg',
    name: 'Dr. Taing Thanith',
    specialty: 'Digital Smile Design & Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Kimly',
    credential: 'DDS, POS',
    detail: doctorDetail({
      education: [
        'DDS',
        'Progressive Orthodontics Seminars POS',
        'Certificate of Endodontic',
        'Certificate of Implant',
        'Full Mouth Reconstruction',
      ],
      pageDescription: 'Full mouth reconstruction, orthodontics, endodontics, and implant care.',
      profileHref: '/doctors/chea-kimly',
      services: ['Full Mouth Reconstruction', 'Orthodontics', 'Endodontics', 'Implant Dentistry'],
    }),
    focus: 'Full Mouth Reconstruction',
    imageAlt: 'Portrait of Dr. Chea Kimly',
    imageUrl: '/assets/landing/doctor-chea-kimly-new.jpg',
    name: 'Dr. Chea Kimly',
    specialty: 'Orthodontics, Endodontics & Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Bunhabb',
    credential: 'ENDODONTIC',
    detail: doctorDetail({
      education: ['Certificate of Implant', 'Certificate of Endodontic'],
      pageDescription: 'Endodontic and implantology specialist.',
      profileHref: '/doctors/heng-bunhabb',
      services: ['Endodontics', 'Implant Dentistry'],
    }),
    focus: 'Implantology Specialist',
    imageAlt: 'Portrait of Dr. Heng Bunhabb',
    imageUrl: '/assets/landing/doctor-heng-bunhabb.jpg',
    name: 'Dr. Heng Bunhabb',
    specialty: 'Implant Dentistry & Endodontics',
  },
];

function homeHref(href: string) {
  return href.startsWith('#') ? `/${href}` : href;
}

function pageNavigation(navigation: LandingNavigationItem[]) {
  return navigation.map((item) => ({
    ...item,
    href: item.label === 'Doctors' ? '/doctors' : homeHref(item.href),
  }));
}

function doctorByHref(profileHref: string) {
  const doctor = doctorProfiles.find((profile) => profile.detail.profileHref === profileHref);

  if (!doctor) {
    throw new Error(`Doctor profile not found: ${profileHref}`);
  }

  return doctor;
}

function publicPageFooter() {
  const doctorsFooterServiceLinks = [
    { href: '/#services', label: 'General Dentistry' },
    { href: '/#services', label: 'Orthodontic' },
    { href: '/#services', label: 'Root Canal Treatment' },
    { href: '/#services', label: 'Pediatric Dentistry' },
    { href: '/#services', label: 'Dental Implant' },
    { href: '/#services', label: 'Digital Smile Design' },
    { href: '/#showcase', label: 'Showcase' },
  ];

  return {
    ...landingPageContent.footer,
    branchLinks: landingPageContent.footer.branchLinks.map((link) => ({
      ...link,
      href: homeHref(link.href),
    })),
    linkGroups: landingPageContent.footer.linkGroups.map((group) => ({
      ...group,
      links:
        group.title === 'Services'
          ? doctorsFooterServiceLinks
          : group.links.map((link) => ({
              ...link,
              href: link.label === 'Doctor' ? '/doctors' : homeHref(link.href),
            })),
    })),
  };
}

const landingPageContent: LandingPageContent = {
  actions: {
    appointmentLabel: 'Book Appointment',
    contactLabel: 'Contact Us',
  },
  navigation: [
    { href: '/', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#doctors', label: 'Doctors' },
    { href: '#branches', label: 'Branches' },
  ],
  heroes: [
    {
      address: 'Toul Tompoung Branch, Phnom Penh',
      appointmentLabel: 'Book Appointment',
      callLabel: 'Contact',
      imageAlt: 'Arunreah Dental Clinic Toul Tompoung exterior',
      imageUrl: '/assets/landing/hero-clinic.png',
      locationLabel: 'Arunreah Dental Clinic',
      phones: ['069 978 997', '061 978 997'],
      qrImageUrl: '/assets/landing/qr-code.png',
      qrLabel: 'Clinic QR code',
    },
    {
      address: 'Psa Chas, Phnom Penh',
      appointmentLabel: 'Book Appointment',
      callLabel: 'Contact',
      imageAlt: 'Arunreah Dental Clinic Psa Chas exterior',
      imageUrl: '/assets/landing/hero-psa-chas.png',
      locationLabel: 'Arunreah Dental Clinic',
      phones: ['012 964 200', '098 701 302'],
      qrImageUrl: '/assets/landing/qr-code.png',
      qrLabel: 'Clinic QR code',
    },
  ],
  services: [
    {
      description: 'Professional check-ups and cleanings for optimal oral health.',
      iconAlt: 'General dentistry icon',
      iconUrl: '/assets/landing/service-icon-general.svg',
      imageAlt: 'White tooth and toothbrush for general dental care',
      imageUrl: '/assets/landing/service-general.png',
      name: 'General Dentistry',
    },
    {
      description: 'Advanced care for gum disease and periodontal tissues.',
      iconAlt: 'Gum and periodontal treatment icon',
      iconUrl: '/assets/landing/service-icon-periodontics.svg',
      imageAlt: 'Dental implant model for periodontic care',
      imageUrl: '/assets/landing/service-periodontics.png',
      name: 'Gum & Periodontal Treatment',
    },
    {
      description: "Gentle dental care designed specifically for children's needs.",
      iconAlt: 'Pediatric dentistry icon',
      iconUrl: '/assets/landing/service-icon-general.svg',
      imageAlt: 'White tooth and toothbrush for pediatric dental care',
      imageUrl: '/assets/landing/service-general.png',
      name: 'Pediatric Dentistry',
    },
    {
      description: 'Enhancing your smile with veneers, whitening, and more.',
      iconAlt: 'Cosmetic dentistry icon',
      iconUrl: '/assets/landing/service-icon-veneer.svg',
      imageAlt: 'White porcelain dental veneers',
      imageUrl: '/assets/landing/service-veneer.png',
      name: 'Cosmetic Dentistry',
    },
    {
      description: 'Pain-free solutions to save damaged teeth and restore function.',
      iconAlt: 'Root canal and filling icon',
      iconUrl: '/assets/landing/service-icon-root-canal.svg',
      imageAlt: 'Tooth model showing root canal treatment',
      imageUrl: '/assets/landing/service-root-canal.png',
      name: 'Root Canal & Filling',
    },
    {
      description: 'Modern braces and aligners for a perfectly straight smile.',
      iconAlt: 'Orthodontics icon',
      iconUrl: '/assets/landing/service-icon-orthodontic.svg',
      imageAlt: 'Orthodontic braces model',
      imageUrl: '/assets/landing/service-orthodontic.png',
      name: 'Orthodontics',
    },
    {
      description: 'Specialized surgical procedures including extractions and implants.',
      iconAlt: 'Oral surgery icon',
      iconUrl: '/assets/landing/service-icon-implant.svg',
      imageAlt: 'Dental implant service model',
      imageUrl: '/assets/landing/service-implant.png',
      name: 'Oral Surgery',
    },
    {
      description: 'High-definition digital X-rays for accurate clinical diagnosis.',
      iconAlt: 'Radiology icon',
      iconUrl: '/assets/landing/service-icon-smile-design.svg',
      imageAlt: 'Smile design software on a monitor',
      imageUrl: '/assets/landing/service-smile-design.png',
      name: 'Radiology',
    },
  ],
  doctors: [
    doctorByHref('/doctors/chho-sonthary'),
    doctorByHref('/doctors/sreng-heng'),
    doctorByHref('/doctors/yim-delux'),
    doctorByHref('/doctors/chuong-kunthy'),
  ],
  branches: [
    {
      hours: 'Mon - Sun, 8:00 AM - 7:00 PM',
      imageAlt: 'Bright Arunreah Dental Clinic reception interior',
      imageUrl: '/assets/landing/branch-card-clinic.png',
      name: 'Arunreah Dental Clinic-TTP',
      phones: ['098 701 302', '012 964 200'],
    },
    {
      hours: 'Mon - Sun, 8:00 AM - 7:00 PM',
      imageAlt: 'Modern dental clinic reception area',
      imageUrl: '/assets/landing/branch-card-clinic.png',
      name: 'Arunreah Dental Clinic-Psa Chas',
      phones: ['069 978 997', '061 978 997'],
    },
  ],
  showcase: [
    {
      imageAlt: 'Smiling family together',
      imageUrl: '/assets/landing/showcase-family.png',
      title: "Caring For Your Family's Smile At Every Age",
    },
    {
      imageAlt: 'Clean dental treatment room',
      imageUrl: '/assets/landing/showcase-room.png',
      title: 'What To Expect During Your First Visit',
    },
    {
      imageAlt: 'Toothbrush with toothpaste on a blue background',
      imageUrl: '/assets/landing/showcase-toothbrush.png',
      title: 'Simple Habits For Healthier Teeth',
    },
  ],
  footer: {
    branchLinks: [
      { href: '#branches', label: 'Toul Tompoung Branch' },
      { href: '#branches', label: 'Psa Chas Branch' },
    ],
    description:
      'Providing medical luxury dental care with a focus on precision, comfort, and professional excellence.',
    tagline: 'Healthy smiles for a better life.',
    linkGroups: [
      {
        title: 'Quick Links',
        links: [
          { href: '/', label: 'Home' },
          { href: '#about', label: 'About' },
          { href: '#services', label: 'Services' },
          { href: '#doctors', label: 'Doctor' },
          { href: '#branches', label: 'Branches' },
        ],
      },
      {
        title: 'Services',
        links: [
          { href: '#services', label: 'General Dentistry' },
          { href: '#services', label: 'Gum & Periodontal Treatment' },
          { href: '#services', label: 'Pediatric Dentistry' },
          { href: '#services', label: 'Cosmetic Dentistry' },
          { href: '#services', label: 'Root Canal & Filling' },
          { href: '#services', label: 'Orthodontics' },
          { href: '#services', label: 'Oral Surgery' },
          { href: '#services', label: 'Radiology' },
          { href: '#showcase', label: 'Showcase' },
        ],
      },
    ],
  },
};

export async function fetchLandingPage(): Promise<LandingPageContent> {
  return landingPageContent;
}

export async function fetchDoctorsPage(): Promise<DoctorsPageContent> {
  return {
    actions: landingPageContent.actions,
    doctors: doctorProfiles,
    footer: publicPageFooter(),
    hero: {
      description:
        'Dedicated professionals committed to providing the highest standard of dental care with a compassionate approach.',
      title: 'Our Expert Medical Team',
    },
    navigation: pageNavigation(landingPageContent.navigation),
    services: landingPageContent.services,
  };
}

export async function fetchDoctorDetail(profileSlug: string | undefined): Promise<DoctorDetailContent> {
  return {
    actions: landingPageContent.actions,
    doctor: doctorProfiles.find((doctor) => doctor.detail.profileHref.endsWith(`/${profileSlug}`)),
    footer: publicPageFooter(),
    navigation: pageNavigation(landingPageContent.navigation),
    services: landingPageContent.services,
  };
}
