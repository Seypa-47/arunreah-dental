import type {
  DoctorsPageContent,
  LandingPageContent,
  LandingNavigationItem,
} from '@/features/landing-page/types';

const allDoctors = [
  {
    bookingLabel: 'Book with Asst.Prof. Heng',
    credential: 'DDS, 25+ YEARS EXPERIENCE',
    focus: 'Implant Specialist',
    imageAlt: 'Portrait of Asst.Prof. Sreng Heng',
    imageUrl: '/assets/landing/doctor-sreng-heng.jpg',
    name: 'Asst.Prof. Sreng Heng',
    profileHref: '/doctors/sreng-heng',
    skills: ['Implant Dentistry'],
    specialty: 'Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Sontary',
    credential: 'DDS, POS',
    focus: 'ICCDE Member',
    imageAlt: 'Portrait of Dr. Chho Sontary',
    imageUrl: '/assets/landing/doctor-chho-sontary.jpg',
    name: 'Dr. Chho Sonthary',
    profileHref: '/doctors/chho-sonthary',
    skills: ['Orthodontics', 'Implant Dentistry'],
    specialty: 'Orthodontics & Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Delux',
    credential: 'M.SC. ORTHODONTICS',
    focus: 'Orthodontics Specialist (Germany)',
    imageAlt: 'Portrait of Dr. Yim Delux',
    imageUrl: '/assets/landing/doctor-yim-delux-new.jpg',
    name: 'Dr. Yim Delux',
    profileHref: '/doctors/yim-delux',
    skills: ['Orthodontics'],
    specialty: 'Orthodontics',
  },
  {
    bookingLabel: 'Book with Dr. Kunthy',
    credential: 'DDS, DIPLOMA IN IMPLANTOLOGY',
    focus: 'Implantology Specialist (Germany)',
    imageAlt: 'Portrait of Dr. Chuong Kunthy',
    imageUrl: '/assets/landing/doctor-chuong-kunthy.jpg',
    name: 'Dr. Chuong Kunthy',
    profileHref: '/doctors/chuong-kunthy',
    skills: ['Implant Dentistry'],
    specialty: 'Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Thanith',
    credential: 'DDS',
    focus: 'Digital Smile Design',
    imageAlt: 'Portrait of Dr. Taing Thanith',
    imageUrl: '/assets/landing/doctor-taing-thanith-new.jpg',
    name: 'Dr. Taing Thanith',
    profileHref: '/doctors/taing-thanith',
    skills: ['Digital Smile Design', 'Implant Dentistry'],
    specialty: 'Digital Smile Design & Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Kimly',
    credential: 'DDS, POS',
    focus: 'Full Mouth Reconstruction',
    imageAlt: 'Portrait of Dr. Chea Kimly',
    imageUrl: '/assets/landing/doctor-chea-kimly-new.jpg',
    name: 'Dr. Chea Kimly',
    profileHref: '/doctors/chea-kimly',
    skills: ['Orthodontics', 'Endodontics', 'Implant Dentistry', 'Full Mouth Reconstruction'],
    specialty: 'Orthodontics, Endodontics & Implant Dentistry',
  },
  {
    bookingLabel: 'Book with Dr. Bunhabb',
    credential: 'ENDODONTIC',
    focus: 'Implantology Specialist',
    imageAlt: 'Portrait of Dr. Heng Bunhabb',
    imageUrl: '/assets/landing/doctor-heng-bunhabb.jpg',
    name: 'Dr. Heng Bunhabb',
    profileHref: '/doctors/heng-bunhabb',
    skills: ['Implant Dentistry', 'Endodontics'],
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
  doctors: allDoctors.slice(0, 4),
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
    actions: landingPageContent.actions,
    doctors: allDoctors,
    footer: {
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
    },
    hero: {
      description:
        'Dedicated professionals committed to providing the highest standard of dental care with a compassionate approach.',
      title: 'Our Expert Medical Team',
    },
    navigation: pageNavigation(landingPageContent.navigation),
    services: landingPageContent.services,
  };
}
