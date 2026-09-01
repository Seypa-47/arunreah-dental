import type {
  AboutPageContent,
  BranchesPageContent,
  ContactPageContent,
  DoctorDetailContent,
  DoctorsPageContent,
  LandingDoctor,
  LandingPageContent,
  LandingNavigationItem,
  LandingService,
  ServiceDetailContent,
  ServicesPageContent,
} from '@/features/landing-page/types';

function doctorDetail({
  about,
  certifications,
  education,
  experience = 'Full profile information will be updated soon.',
  heroSummary,
  pageDescription,
  profileHref,
  roleTitle,
  services,
  stats,
}: {
  about: string[];
  certifications: LandingDoctor['detail']['certifications'];
  education: string[];
  experience?: string;
  heroSummary: string;
  pageDescription: string;
  profileHref: string;
  roleTitle: string;
  services: string[];
  stats: LandingDoctor['detail']['stats'];
}): LandingDoctor['detail'] {
  return {
    about,
    biography:
      'Full doctor biography and consultation information will be updated when the clinic provides the final profile content.',
    certifications,
    education,
    experience,
    heroSummary,
    languages: ['English', 'Khmer'],
    pageDescription,
    profileHref,
    roleTitle,
    services,
    stats,
  };
}

const doctorProfiles: LandingDoctor[] = [
  {
    bookingLabel: 'Book with Asst.Prof. Heng',
    credential: 'DDS, 25+ YEARS EXPERIENCE',
    detail: doctorDetail({
      about: [
        'Asst. Prof. Sreng Heng is a senior implant specialist with more than 25 years of clinical experience in restorative and implant dentistry.',
        'His work combines academic discipline with practical treatment planning, helping patients receive stable, natural-looking implant and rehabilitation care.',
      ],
      certifications: [
        { institution: 'University of Health Sciences', title: 'DDS (Doctor of Dental Surgery)' },
        { institution: 'Advanced implant training', title: 'Certificate of Implant' },
        { institution: 'Faculty of Dentistry', title: 'Assistant Professor' },
      ],
      education: ['DDS', 'Certificate of Implant'],
      experience: '25+ years of dental experience with advanced implant care.',
      heroSummary:
        'A leading expert in implantology with over 25 years of clinical excellence and academic contribution.',
      pageDescription: 'Implant specialist with 25+ years of dental experience.',
      profileHref: '/doctors/sreng-heng',
      roleTitle: 'Senior Implant Specialist',
      services: ['Implant Dentistry'],
      stats: [
        { label: 'Years Experience', value: '25+' },
        { label: 'Implant Focus', value: '10k+' },
        { label: 'Patient Care', value: '99%' },
      ],
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
      about: [
        'Dr. Chho Sonthary focuses on orthodontics and implant dentistry, with training through Progressive Orthodontics Seminars and implant certification.',
        'She brings a careful, patient-centered approach to smile alignment, functional bite improvement, and long-term restorative planning.',
      ],
      certifications: [
        { institution: 'University of Health Sciences', title: 'DDS (Doctor of Dental Surgery)' },
        { institution: 'Progressive Orthodontics Seminars', title: 'POS Orthodontics Training' },
        { institution: 'Advanced implant training', title: 'Certificate of Implant' },
        { institution: 'International Congress of Oral Implantologists', title: 'ICCDE Member' },
      ],
      education: ['DDS', 'Progressive Orthodontics Seminars POS', 'Certificate of Implant', 'Member of ICCDE'],
      heroSummary:
        'An orthodontics and implant dentistry clinician focused on healthy alignment, confident smiles, and precise restorative care.',
      pageDescription: 'Orthodontics and implant dentistry specialist.',
      profileHref: '/doctors/chho-sonthary',
      roleTitle: 'Orthodontics & Implant Dentistry',
      services: ['Orthodontics', 'Implant Dentistry'],
      stats: [
        { label: 'Core Specialties', value: '2' },
        { label: 'Certifications', value: '4' },
        { label: 'Patient Care', value: '99%' },
      ],
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
      about: [
        'Dr. Yim Delux is an orthodontics specialist with M.Sc. training from Duisburg-Essen University in Germany.',
        'His clinical focus is on structured orthodontic planning, bite correction, and creating balanced smiles through modern orthodontic techniques.',
      ],
      certifications: [
        { institution: 'Duisburg-Essen University, Germany', title: 'M.Sc. Orthodontics' },
        { institution: 'Progressive Orthodontics Seminars', title: 'POS Orthodontics Training' },
        { institution: 'University of Health Sciences', title: 'DDS (Doctor of Dental Surgery)' },
        { institution: 'PFA, ICCDE, CDA, CAO', title: 'Professional Memberships' },
      ],
      education: ['M.Sc. Orthodontics', 'Progressive Orthodontics Seminars POS', 'DDS'],
      heroSummary:
        'A Germany-trained orthodontics specialist helping patients improve alignment, bite function, and smile confidence.',
      pageDescription: 'Orthodontics specialist trained in Germany.',
      profileHref: '/doctors/yim-delux',
      roleTitle: 'Orthodontics Specialist',
      services: ['Orthodontics'],
      stats: [
        { label: 'Specialty Focus', value: 'M.Sc.' },
        { label: 'Memberships', value: '4' },
        { label: 'Patient Care', value: '99%' },
      ],
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
      about: [
        'Dr. Chuong Kunthy specializes in implant dentistry with implant training from the University of Puthisastra and diploma-level implant study in Germany.',
        'He focuses on careful implant treatment planning, functional restoration, and predictable outcomes for missing-tooth replacement.',
      ],
      certifications: [
        { institution: 'University of Health Sciences', title: 'DDS (Doctor of Dental Surgery)' },
        { institution: 'University of Puthisastra', title: 'Certificate of Implant' },
        { institution: 'Frankfurt University, Germany', title: 'Diploma of Implant' },
      ],
      education: ['DDS', 'Certificate of Implant', 'Diploma of Implant, Frankfurt University Germany'],
      heroSummary:
        'A Germany-trained implantology clinician focused on precise implant planning and long-lasting restorative outcomes.',
      pageDescription: 'Implantology specialist trained in Germany.',
      profileHref: '/doctors/chuong-kunthy',
      roleTitle: 'Implantology Specialist',
      services: ['Implant Dentistry'],
      stats: [
        { label: 'Implant Training', value: 'DE' },
        { label: 'Credentials', value: '3' },
        { label: 'Patient Care', value: '99%' },
      ],
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
      about: [
        'Dr. Taing Thanith provides digital smile design and implant dentistry care, combining aesthetic planning with restorative function.',
        'His approach helps patients visualize treatment goals and receive coordinated care for natural-looking smile improvements.',
      ],
      certifications: [
        { institution: 'University of Health Sciences', title: 'DDS (Doctor of Dental Surgery)' },
        { institution: 'Digital Smile Design Training', title: 'Diploma of Digital Smile' },
        { institution: 'Advanced implant training', title: 'Certificate of Implant' },
      ],
      education: ['DDS', 'Diploma of Digital Smile', 'Certificate of Implant'],
      heroSummary:
        'A digital smile design clinician focused on aesthetic planning, implant care, and confident smile transformation.',
      pageDescription: 'Digital smile design and implant dentistry care.',
      profileHref: '/doctors/taing-thanith',
      roleTitle: 'Digital Smile Design Clinician',
      services: ['Digital Smile Design', 'Implant Dentistry'],
      stats: [
        { label: 'Smile Planning', value: 'DSD' },
        { label: 'Credentials', value: '3' },
        { label: 'Patient Care', value: '99%' },
      ],
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
      about: [
        'Dr. Chea Kimly works across full mouth reconstruction, orthodontics, endodontics, and implant dentistry.',
        'His broad training supports complex treatment plans where bite, tooth structure, root health, and restorative outcomes need to work together.',
      ],
      certifications: [
        { institution: 'University of Health Sciences', title: 'DDS (Doctor of Dental Surgery)' },
        { institution: 'Progressive Orthodontics Seminars', title: 'POS Orthodontics Training' },
        { institution: 'Advanced endodontic training', title: 'Certificate of Endodontic' },
        { institution: 'Advanced implant training', title: 'Certificate of Implant' },
        { institution: 'Full Mouth Reconstruction Training', title: 'Full Mouth Reconstruction' },
      ],
      education: [
        'DDS',
        'Progressive Orthodontics Seminars POS',
        'Certificate of Endodontic',
        'Certificate of Implant',
        'Full Mouth Reconstruction',
      ],
      heroSummary:
        'A multidisciplinary clinician focused on full mouth reconstruction, orthodontics, endodontics, and implant care.',
      pageDescription: 'Full mouth reconstruction, orthodontics, endodontics, and implant care.',
      profileHref: '/doctors/chea-kimly',
      roleTitle: 'Full Mouth Reconstruction Clinician',
      services: ['Full Mouth Reconstruction', 'Orthodontics', 'Endodontics', 'Implant Dentistry'],
      stats: [
        { label: 'Care Areas', value: '4' },
        { label: 'Credentials', value: '5' },
        { label: 'Patient Care', value: '99%' },
      ],
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
      about: [
        'Dr. Heng Bunhabb focuses on endodontic care and implant dentistry, with certification in both treatment areas.',
        'He supports patients who need root-focused dental treatment, tooth preservation planning, and implant-based restoration options.',
      ],
      certifications: [
        { institution: 'University of Health Sciences', title: 'DDS (Doctor of Dental Surgery)' },
        { institution: 'Advanced implant training', title: 'Certificate of Implant' },
        { institution: 'Advanced endodontic training', title: 'Certificate of Endodontic' },
      ],
      education: ['Certificate of Implant', 'Certificate of Endodontic'],
      heroSummary:
        'An endodontic and implant dentistry clinician focused on tooth preservation and restorative treatment planning.',
      pageDescription: 'Endodontic and implantology specialist.',
      profileHref: '/doctors/heng-bunhabb',
      roleTitle: 'Endodontic & Implant Dentistry',
      services: ['Endodontics', 'Implant Dentistry'],
      stats: [
        { label: 'Core Specialties', value: '2' },
        { label: 'Credentials', value: '3' },
        { label: 'Patient Care', value: '99%' },
      ],
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

function serviceSlug(name: string) {
  return name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');
}

function pageNavigation(navigation: LandingNavigationItem[]) {
  return navigation.map((item) => ({
    ...item,
    href:
      item.label === 'About'
        ? '/about'
        : item.label === 'Services'
          ? '/services'
        : item.label === 'Doctors'
          ? '/doctors'
            : item.label === 'Branches'
              ? '/branches'
              : item.label === 'Contact'
                ? '/contact'
              : homeHref(item.href),
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
    { href: '/services/general-dentistry', label: 'General Dentistry' },
    { href: '/services/orthodontics', label: 'Orthodontic' },
    { href: '/services/root-canal', label: 'Root Canal Treatment' },
    { href: '/services/pediatric-dentistry', label: 'Pediatric Dentistry' },
    { href: '/services/dental-implants', label: 'Dental Implant' },
    { href: '/services/cosmetic-dentistry', label: 'Digital Smile Design' },
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
              href:
                link.label === 'Doctor' || link.label === 'Doctors'
                  ? '/doctors'
                  : link.label === 'Services'
                    ? '/services'
                    : homeHref(link.href),
            })),
    })),
  };
}

const servicesPageServices: LandingService[] = [
  {
    description: 'Routine dental care, examinations, cleaning, fillings, and preventive treatments.',
    iconAlt: 'General dentistry icon',
    iconUrl: '/assets/landing/service-icon-general.svg',
    imageAlt: 'Modern dental equipment for general dentistry',
    imageUrl: '/assets/landing/branches-clinic.png',
    name: 'General Dentistry',
  },
  {
    description: 'Modern tooth replacement solutions designed to restore missing teeth, function, and appearance.',
    iconAlt: 'Dental implants icon',
    iconUrl: '/assets/landing/service-icon-implant.svg',
    imageAlt: 'Dental implant model',
    imageUrl: '/assets/landing/service-implant.png',
    name: 'Dental Implants',
  },
  {
    description: 'Braces and orthodontic treatments designed to improve tooth alignment and bite.',
    iconAlt: 'Orthodontics icon',
    iconUrl: '/assets/landing/service-icon-orthodontic.svg',
    imageAlt: 'Orthodontic braces model',
    imageUrl: '/assets/landing/service-orthodontic.png',
    name: 'Orthodontics',
  },
  {
    description: "Dental treatments focused on improving the appearance and confidence of a patient's smile.",
    iconAlt: 'Cosmetic dentistry icon',
    iconUrl: '/assets/landing/service-icon-veneer.svg',
    imageAlt: 'Cosmetic dentistry smile preview',
    imageUrl: '/assets/landing/service-veneer.png',
    name: 'Cosmetic Dentistry',
  },
  {
    description: 'Professional whitening treatment designed to brighten teeth and improve smile appearance.',
    iconAlt: 'Teeth whitening icon',
    iconUrl: '/assets/landing/service-icon-smile-design.svg',
    imageAlt: 'Bright dental treatment room for whitening',
    imageUrl: '/assets/landing/figma-branches/image3_183_4173.jpg',
    name: 'Teeth Whitening',
  },
  {
    description: 'Treatment designed to save and restore teeth affected by infection or damage inside the tooth.',
    iconAlt: 'Root canal icon',
    iconUrl: '/assets/landing/service-icon-root-canal.svg',
    imageAlt: 'Root canal treatment model',
    imageUrl: '/assets/landing/service-root-canal.png',
    name: 'Root Canal',
  },
  {
    description: 'Friendly dental care specifically designed for children and their developing teeth.',
    iconAlt: 'Pediatric dentistry icon',
    iconUrl: '/assets/landing/service-icon-general.svg',
    imageAlt: 'Pediatric dental care room',
    imageUrl: '/assets/landing/service-general.png',
    name: 'Pediatric Dentistry',
  },
  {
    description: 'Specialized procedures including tooth extraction, wisdom tooth treatment, and surgical care.',
    iconAlt: 'Oral surgery icon',
    iconUrl: '/assets/landing/service-icon-implant.svg',
    imageAlt: 'Dental surgical instruments',
    imageUrl: '/assets/landing/branch-card-clinic.png',
    name: 'Oral Surgery',
  },
];

type ServiceDetail = NonNullable<ServiceDetailContent['service']>;

function buildServiceDetail({
  aboutImageUrl,
  benefits,
  eyebrow,
  heroImageUrl,
  service,
  subtitle,
}: {
  aboutImageUrl?: string;
  benefits: ServiceDetail['benefits'];
  eyebrow?: string;
  heroImageUrl?: string;
  service: LandingService;
  subtitle?: string;
}): ServiceDetail {
  return {
    ...service,
    about: {
      imageAlt: `${service.name} treatment detail`,
      imageUrl: aboutImageUrl ?? service.imageUrl,
      paragraphs: [
        `${service.name} focuses on restoring comfort, function, and confidence with careful diagnosis and personalized treatment planning.`,
        'Our team explains each step clearly, uses modern clinical techniques, and recommends treatment options based on your oral health needs.',
      ],
      title: `About ${service.name}`,
    },
    benefits,
    cta: {
      appointmentLabel: 'Book Your Appointment',
      contactLabel: 'Contact Our Clinic',
      description: `Schedule a consultation with our dental team and discover how ${service.name.toLowerCase()} can support your smile.`,
      title: 'Ready to Take Care of Your Smile?',
    },
    glance: {
      actionLabel: 'Book Initial Assessment',
      items: [
        { description: '3 - 9 Months (varies per patient)', icon: 'clock', label: 'Duration' },
        { description: '7 - 10 Days post-treatment', icon: 'recovery', label: 'Recovery' },
        { description: '4 - 6 Appointments', icon: 'calendar', label: 'Number of Visits' },
        { description: 'Initial Assessment Required', icon: 'consultation', label: 'Consultation' },
      ],
      title: 'Treatment at a Glance',
    },
    hero: {
      appointmentLabel: 'Book an Appointment',
      consultationLabel: 'Request Consultation',
      eyebrow: eyebrow ?? service.name,
      imageAlt: `${service.name} patient smile`,
      imageUrl: heroImageUrl ?? service.imageUrl,
      subtitle: subtitle ?? service.description,
      title: `Restore Your Smile with ${service.name}`,
    },
    slug: serviceSlug(service.name),
  };
}

const serviceDetails: ServiceDetail[] = servicesPageServices.map((service) => {
  if (service.name === 'Dental Implants') {
    return buildServiceDetail({
      aboutImageUrl: '/assets/landing/service-implant.png',
      benefits: [
        {
          description: 'Implants look, feel, and function just like your own natural teeth, seamlessly blending with your smile.',
          icon: 'smile',
          title: 'Natural Appearance',
        },
        {
          description: 'Eat all your favorite foods with confidence. Implants provide superior chewing power compared to dentures.',
          icon: 'utensils',
          title: 'Improved Function',
        },
        {
          description: 'With proper care, dental implants can last a lifetime, making them a highly cost-effective choice.',
          icon: 'shield',
          title: 'Long-Term Solution',
        },
        {
          description: 'Because they are anchored in the jaw, they eliminate the discomfort and rubbing associated with removable dentures.',
          icon: 'check',
          title: 'Comfortable Fit',
        },
        {
          description: 'A complete smile boosts your self-esteem, allowing you to speak and laugh without hesitation.',
          icon: 'star',
          title: 'Improved Confidence',
        },
        {
          description: 'Implants help preserve the jawbone and prevent bone loss, maintaining your overall facial structure.',
          icon: 'heart',
          title: 'Supports Oral Health',
        },
      ],
      eyebrow: 'Dental Implants',
      heroImageUrl: '/assets/landing/service-veneer.png',
      service,
      subtitle:
        'A permanent, natural-looking solution for missing teeth. Regain your confidence and oral function with our advanced implant technology.',
    });
  }

  return buildServiceDetail({
    benefits: [
      {
        description: 'Care plans are shaped around your diagnosis, goals, comfort, and long-term oral health.',
        icon: 'check',
        title: 'Personalized Care',
      },
      {
        description: 'Modern equipment and clinical techniques help make treatment accurate, efficient, and comfortable.',
        icon: 'shield',
        title: 'Modern Technique',
      },
      {
        description: 'Our team focuses on natural-looking outcomes that support your confidence every day.',
        icon: 'smile',
        title: 'Confident Results',
      },
      {
        description: 'Clear guidance helps you understand each step before, during, and after your appointment.',
        icon: 'heart',
        title: 'Patient Comfort',
      },
      {
        description: 'Treatment planning considers both immediate needs and long-term smile health.',
        icon: 'star',
        title: 'Lasting Value',
      },
      {
        description: 'We help protect healthy teeth and gums while improving function and appearance.',
        icon: 'utensils',
        title: 'Better Function',
      },
    ],
    service,
  });
});

const landingPageContent: LandingPageContent = {
  actions: {
    appointmentLabel: 'Book Appointment',
    contactLabel: 'Contact Us',
  },
  navigation: [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/doctors', label: 'Doctors' },
    { href: '/branches', label: 'Branches' },
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
      { href: '/branches', label: 'Toul Tompoung Branch' },
      { href: '/branches', label: 'Psa Chas Branch' },
    ],
    description:
      'Providing medical luxury dental care with a focus on precision, comfort, and professional excellence.',
    tagline: 'Healthy smiles for a better life.',
    linkGroups: [
      {
        title: 'Quick Links',
        links: [
          { href: '/', label: 'Home' },
          { href: '/about', label: 'About' },
          { href: '/services', label: 'Services' },
          { href: '/doctors', label: 'Doctors' },
          { href: '/branches', label: 'Branches' },
          { href: '/contact', label: 'Contact' },
        ],
      },
      {
        title: 'Services',
        links: [
          { href: '/services/general-dentistry', label: 'General Dentistry' },
          { href: '/services/dental-implants', label: 'Dental Implant' },
          { href: '/services/orthodontics', label: 'Orthodontic' },
          { href: '/services/cosmetic-dentistry', label: 'Cosmetic Dentistry' },
          { href: '/services/teeth-whitening', label: 'Teeth Whitening' },
          { href: '/services/root-canal', label: 'Root Canal Treatment' },
          { href: '/services/pediatric-dentistry', label: 'Pediatric Dentistry' },
          { href: '/services/oral-surgery', label: 'Oral Surgery' },
          { href: '#showcase', label: 'Showcase' },
        ],
      },
    ],
  },
};

export async function fetchLandingPage(): Promise<LandingPageContent> {
  return landingPageContent;
}

export async function fetchBranchesPage(): Promise<BranchesPageContent> {
  return {
    actions: landingPageContent.actions,
    benefits: [
      {
        description: 'Advanced equipment for precise diagnosis and effective treatment.',
        iconUrl: '/assets/landing/benefit-technology.svg',
        title: 'Modern Technology',
      },
      {
        description: 'Two easily accessible branches in Phnom Penh.',
        iconUrl: '/assets/landing/benefit-location.svg',
        title: 'Convenient Locations',
      },
      {
        description: 'A relaxing environment with gentle, patient-centered care.',
        iconUrl: '/assets/landing/benefit-care.svg',
        title: 'Comfort & Care',
      },
      {
        description: 'Skilled and compassionate professionals you can trust.',
        iconUrl: '/assets/landing/benefit-team.svg',
        title: 'Experienced Team',
      },
    ],
    branches: [
      {
        address: '#123, Street 155, Sangkat Toul Tompoung I, Khan Chamkarmon, Phnom Penh, Cambodia',
        badge: 'Toul Tompoung Branch',
        bookingLabel: 'Book at this Branch',
        directionsLabel: 'Get Directions',
        directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Arunreah%20Dental%20Clinic%20Toul%20Tompoung',
        hoursDays: 'Mon - Sun',
        hoursTime: '8:00 AM - 7:00 PM',
        imageAlt: 'Bright dental clinic treatment room at Arunreah Dental Clinic Toul Tompoung',
        imageUrl: '/assets/landing/figma-branches/image3_183_4173.jpg',
        mapLabel: 'View on Map',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Arunreah%20Dental%20Clinic%20Toul%20Tompoung',
        name: 'Arunreah Dental Clinic - TTP',
        phoneLabel: 'Call Now',
        phones: ['098 701 302', '012 964 200'],
      },
      {
        address: '#45, Street 13, Sangkat Wat Phnom, Khan Daun Penh, Phnom Penh, Cambodia (Near Old Market)',
        badge: 'Psa Chas Branch',
        bookingLabel: 'Book at this Branch',
        directionsLabel: 'Get Directions',
        directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Arunreah%20Dental%20Clinic%20Psa%20Chas',
        hoursDays: 'Mon - Sun',
        hoursTime: '8:00 AM - 7:00 PM',
        imageAlt: 'Modern clinic reception at Arunreah Dental Clinic Psa Chas',
        imageUrl: '/assets/landing/figma-branches/image4_183_4173.jpg',
        mapLabel: 'View on Map',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Arunreah%20Dental%20Clinic%20Psa%20Chas',
        name: 'Arunreah Dental Clinic - Psa Chas',
        phoneLabel: 'Call Now',
        phones: ['069 978 997', '061 978 997'],
      },
    ],
    cta: {
      backgroundImageAlt: 'Soft-focus dental treatment room',
      backgroundImageUrl: '/assets/landing/figma-branches/image5_183_4173.jpg',
      buttonLabel: 'Book Appointment',
      eyebrow: 'Ready for a Healthier Dental Clinic?',
      subtitle: 'Our team is here to help you smile with confidence.',
      title: 'Book Your Appointment Today',
    },
    footer: publicPageFooter(),
    hero: {
      appointmentLabel: landingPageContent.actions.appointmentLabel,
      backgroundImageAlt: 'Bright modern Arunreah Dental Clinic treatment room',
      backgroundImageUrl: '/assets/landing/figma-branches/image2_183_4173.png',
      eyebrow: 'Container',
      highlights: [
        {
          iconUrl: '/assets/landing/branches-pin.svg',
          label: '2 Modern Clinics',
        },
        {
          iconUrl: '/assets/landing/branches-check.svg',
          label: 'Same Trusted Care',
        },
      ],
      metrics: [
        {
          description: 'Across Phnom Penh',
          iconUrl: '/assets/landing/branches-pin.svg',
          label: '2 Convenient',
          title: 'Locations',
        },
        {
          description: '8:00 AM - 7:00 PM',
          iconUrl: '/assets/landing/branch-card-clock.svg',
          label: 'Opening Hours',
          title: 'Mon - Sun',
        },
        {
          description: 'Thousands of Patients',
          iconUrl: '/assets/landing/branches-check.svg',
          label: 'Quality Care',
          title: 'Trusted by',
        },
      ],
      subtitle: 'Two convenient locations, the same commitment to exceptional dental care and your bright smile.',
      title: 'Visit Our Clinics',
    },
    navigation: pageNavigation(landingPageContent.navigation),
    sections: {
      benefitsEyebrow: 'Why Visit Arunreah Dental Clinic?',
      benefitsTitle: 'Care You Can Trust',
      branchesDescription: 'Modern facilities, advanced technology, and a caring team ready to help.',
      branchesEyebrow: 'Our Clinic Locations',
      branchesTitle: 'Find a Clinic Near You',
    },
    services: landingPageContent.services,
  };
}

export async function fetchServicesPage(): Promise<ServicesPageContent> {
  return {
    actions: landingPageContent.actions,
    cta: {
      consultationLabel: 'Book a Consultation',
      contactLabel: 'Contact Us',
      description:
        'Our dental team can help you understand your options and recommend an appropriate treatment based on your dental needs.',
      title: 'Not Sure Which Treatment You Need?',
    },
    footer: publicPageFooter(),
    hero: {
      description:
        'Explore our range of dental services designed to support your oral health, restore your smile, and provide personalized care for every stage of life.',
      title: 'Our Services',
    },
    navigation: pageNavigation(landingPageContent.navigation),
    services: servicesPageServices,
  };
}

export async function fetchServiceDetail(serviceSlugParam: string | undefined): Promise<ServiceDetailContent> {
  const service = serviceDetails.find((item) => item.slug === serviceSlugParam);

  return {
    actions: landingPageContent.actions,
    footer: publicPageFooter(),
    navigation: pageNavigation(landingPageContent.navigation),
    otherServices: servicesPageServices.filter((item) => serviceSlug(item.name) !== serviceSlugParam).slice(0, 3),
    service,
    services: servicesPageServices,
  };
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

export async function fetchAboutPage(): Promise<AboutPageContent> {
  return {
    actions: landingPageContent.actions,
    differences: [
      {
        description: 'State-of-the-art equipment ensures accurate diagnosis and effective treatment.',
        iconUrl: '/assets/landing/service-icon-smile-design.svg',
        title: 'Advanced Technology',
      },
      {
        description: 'Relaxing environment and personalized care for a stress-free experience.',
        iconUrl: '/assets/landing/branch-card-clock.svg',
        title: 'Patient Comfort',
      },
      {
        description: 'Highly trained professionals committed to delivering exceptional results.',
        iconUrl: '/assets/landing/service-icon-implant.svg',
        title: 'Expert Specialists',
      },
      {
        description: 'Strict sterilization protocols to ensure the highest standards of safety.',
        iconUrl: '/assets/landing/branches-check.svg',
        title: 'Safe & Sterile',
      },
    ],
    facilities: [
      {
        description: 'Equipped with the latest ergonomic technology for maximum patient comfort during procedures.',
        imageAlt: 'Modern dental treatment room',
        imageUrl: '/assets/landing/branches-clinic.png',
        title: 'Advanced Treatment Rooms',
      },
      {
        description: 'High-precision digital scans for accurate diagnosis and implant planning.',
        imageAlt: 'Digital dental imaging suite',
        imageUrl: '/assets/landing/service-smile-design.png',
        title: 'Digital Imaging Suite',
      },
      {
        description: 'A relaxing environment designed to reduce dental anxiety and provide a premium experience.',
        imageAlt: 'Comfortable patient lounge',
        imageUrl: '/assets/landing/branch-card-clinic.png',
        title: 'VIP Patient Lounge',
      },
    ],
    footer: publicPageFooter(),
    hero: {
      eyebrow: 'Who We Are',
      imageAlt: 'Arunreah Dental Clinic building exterior',
      imageUrl: '/assets/landing/hero-psa-chas.png',
      subtitle: 'Providing world-class dental care with a touch of luxury and precision in Cambodia.',
      title: 'About Arunreah Dental Clinic',
    },
    mission: {
      description:
        'To provide precise, comfortable, and professional dental treatments through a combination of expert specialists, cutting-edge technology, and a relaxing luxury environment.',
      iconUrl: '/assets/landing/service-icon-smile-design.svg',
      title: 'Our Mission',
    },
    navigation: pageNavigation(landingPageContent.navigation),
    services: landingPageContent.services,
    stats: [
      { iconUrl: '/assets/landing/hero-calendar.svg', label: 'Years of Experience', value: '10+' },
      { iconUrl: '/assets/landing/service-icon-implant.svg', label: 'Happy Patients', value: '25,000+' },
      { iconUrl: '/assets/landing/service-icon-general.svg', label: 'Dental Specialists', value: '15+' },
      { iconUrl: '/assets/landing/branches-pin.svg', label: 'Branch Locations', value: '2' },
    ],
    story: {
      eyebrow: 'About Us',
      imageAlt: 'Arunreah Dental Clinic reception area',
      imageUrl: '/assets/landing/branch-card-clinic.png',
      paragraphs: [
        'Founded with a vision to redefine dental care in the region, Arunreah Dental Clinic has been a pioneer in medical luxury. We believe that every smile tells a story, and we are here to ensure yours is bright, healthy, and confident.',
        'From our humble beginnings to becoming one of the most trusted names in dentistry, our commitment to using state-of-the-art technology and providing a patient-centric experience has never wavered.',
      ],
      title: 'Our Story of Excellence',
    },
    vision: {
      description:
        'To be the leading provider of innovative and compassionate dental care in Southeast Asia, recognized for our commitment to quality and patient well-being.',
      iconUrl: '/assets/landing/service-icon-periodontics.svg',
      title: 'Our Vision',
    },
  };
}

export async function fetchContactPage(): Promise<ContactPageContent> {
  const contactCards: ContactPageContent['contactCards'] = [
    {
      description: '098 701 302',
      icon: 'phone',
      label: 'Call Us',
      value: '098 701 302',
    },
    {
      description: 'info@arunreahdental.com',
      icon: 'email',
      label: 'Email Us',
      value: 'info@arunreahdental.com',
    },
    {
      description: '8:00 AM - 7:00 PM',
      icon: 'clock',
      label: 'Opening Hours',
      value: '8:00 AM - 7:00 PM',
    },
    {
      description: '2 branches in Phnom Penh',
      icon: 'location',
      label: 'Visit Us',
      value: '2 branches in Phnom Penh',
    },
  ];

  return {
    actions: landingPageContent.actions,
    contactCards,
    footer: publicPageFooter(),
    form: {
      branches: ['Toul Tompoung Branch', 'Psa Chas Branch'],
      fields: {
        email: 'Email Address',
        fullName: 'Full Name',
        message: 'Message',
        phone: 'Phone Number',
        preferredBranch: 'Preferred Branch',
        preferredDate: 'Preferred Date',
        preferredTime: 'Preferred Time',
        service: 'Service Needed',
      },
      messageLimit: 500,
      placeholders: {
        email: 'Enter your email address',
        fullName: 'Enter your full name',
        message: 'Tell us how we can help you...',
        phone: 'Enter your phone number',
        preferredBranch: 'Select a branch',
        preferredDate: 'Select date',
        preferredTime: 'Select time',
        service: 'Select a service',
      },
      services: landingPageContent.services.map((service) => service.name),
      submitLabel: 'Send Inquiry',
      times: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
      title: 'Send Us a Message',
    },
    hero: {
      backgroundImageAlt: 'Bright modern dental treatment room',
      backgroundImageUrl: '/assets/landing/figma-branches/image2_183_4173.png',
      eyebrow: 'Get In Touch',
      info: [
        {
          description: '098 701 302\n012 964 200',
          icon: 'phone',
          label: 'Call Us',
          value: '098 701 302\n012 964 200',
        },
        {
          description: 'info@arunreahdental.com',
          icon: 'email',
          label: 'Email Us',
          value: 'info@arunreahdental.com',
        },
        {
          description: 'Mon - Sun\n8:00 AM - 7:00 PM',
          icon: 'clock',
          label: 'Opening Hours',
          value: 'Mon - Sun\n8:00 AM - 7:00 PM',
        },
        {
          description: '2 branches in Phnom Penh',
          icon: 'location',
          label: 'Visit Us',
          value: '2 branches in Phnom Penh',
        },
      ],
      subtitle: 'We are here to answer your questions, help you choose the right branch, and book your appointment with ease.',
      title: 'Contact Arunreah',
    },
    maps: [
      {
        imageAlt: 'Map preview for Arunreah Dental Toul Tompoung Branch',
        imageUrl: '/assets/landing/contact-map.svg',
        label: 'Arunreah Dental',
      },
      {
        imageAlt: 'Map preview for Arunreah Dental Psa Chas Branch',
        imageUrl: '/assets/landing/contact-map.svg',
        label: 'Arunreah Dental',
      },
    ],
    navigation: pageNavigation(landingPageContent.navigation),
    services: landingPageContent.services,
  };
}

export async function fetchDoctorDetail(profileSlug: string | undefined): Promise<DoctorDetailContent> {
  const doctor = doctorProfiles.find((profile) => profile.detail.profileHref.endsWith(`/${profileSlug}`));

  return {
    actions: landingPageContent.actions,
    doctor,
    footer: publicPageFooter(),
    navigation: pageNavigation(landingPageContent.navigation),
    otherDoctors: doctorProfiles.filter((profile) => profile.detail.profileHref !== doctor?.detail.profileHref).slice(0, 4),
    services: landingPageContent.services,
  };
}
