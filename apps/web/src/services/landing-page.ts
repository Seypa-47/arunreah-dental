import type { LandingPageContent } from '@/features/landing-page/types';

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
  hero: {
    address: 'តំបន់ផ្សារលើ ក្រុងព្រះសីហនុ ខេត្តព្រះសីហនុ',
    appointmentLabel: 'Book Appointment',
    callLabel: 'ទំនាក់ទំនងលេខទូរស័ព្ទ',
    imageAlt: 'Arunreah Dental Clinic exterior in Sihanoukville',
    imageUrl: '/assets/landing/hero-clinic.png',
    locationLabel: 'ទីតាំងព្យាបាលធ្មេញ',
    phones: ['069 978 997', '061 978 997'],
    qrImageUrl: '/assets/landing/qr-code.png',
    qrLabel: 'Clinic QR code',
  },
  services: [
    {
      iconAlt: 'General dentistry icon',
      iconUrl: '/assets/landing/service-icon-general.svg',
      imageAlt: 'White tooth and toothbrush for general dental care',
      imageUrl: '/assets/landing/service-general.png',
      khmerName: 'ព្យាបាលធ្មេញទូទៅ និងកុមារ',
      name: 'General & Pediatric Dentistry',
    },
    {
      iconAlt: 'Periodontics icon',
      iconUrl: '/assets/landing/service-icon-periodontics.svg',
      imageAlt: 'Dental implant model for periodontic care',
      imageUrl: '/assets/landing/service-periodontics.png',
      khmerName: 'ព្យាបាលរាក់ធ្មេញ',
      name: 'Periodontics',
    },
    {
      iconAlt: 'Orthodontic icon',
      iconUrl: '/assets/landing/service-icon-orthodontic.svg',
      imageAlt: 'Orthodontic braces model',
      imageUrl: '/assets/landing/service-orthodontic.png',
      khmerName: 'តម្រង់ធ្មេញ',
      name: 'Orthodontic',
    },
    {
      iconAlt: 'Root canal icon',
      iconUrl: '/assets/landing/service-icon-root-canal.svg',
      imageAlt: 'Tooth model showing root canal treatment',
      imageUrl: '/assets/landing/service-root-canal.png',
      khmerName: 'ព្យាបាលប្រហោងធ្មេញ',
      name: 'Root Canal Treatment',
    },
    {
      iconAlt: 'Dental implant icon',
      iconUrl: '/assets/landing/service-icon-implant.svg',
      imageAlt: 'Dental implant service model',
      imageUrl: '/assets/landing/service-implant.png',
      khmerName: 'ដាំគ្រាប់ធ្មេញ',
      name: 'Dental Implant',
    },
    {
      iconAlt: 'Veneer icon',
      iconUrl: '/assets/landing/service-icon-veneer.svg',
      imageAlt: 'White porcelain dental veneers',
      imageUrl: '/assets/landing/service-veneer.png',
      khmerName: 'ស្រោបធ្មេញ (Emax)',
      name: 'Emax Veneer',
    },
    {
      iconAlt: 'Digital smile design icon',
      iconUrl: '/assets/landing/service-icon-smile-design.svg',
      imageAlt: 'Smile design software on a monitor',
      imageUrl: '/assets/landing/service-smile-design.png',
      khmerName: 'រចនាស្នាមញញឹមឌីជីថល',
      name: 'Digital Smile Design',
    },
    {
      iconAlt: 'Prosthodontic icon',
      iconUrl: '/assets/landing/service-icon-prosthodontic.svg',
      imageAlt: 'Removable partial denture model',
      imageUrl: '/assets/landing/service-prosthodontic.png',
      khmerName: 'ធ្មេញដោះដាក់',
      name: 'Prosthodontic',
    },
  ],
  doctors: [
    {
      imageAlt: 'Portrait of Dr. Cho Sonthary',
      imageUrl: '/assets/landing/doctor-cho-sonthary.png',
      name: 'Dr. Cho Sonthary',
      specialty: 'Lead Prosthodontist',
    },
    {
      imageAlt: 'Portrait of Dr. Chea Kimly',
      imageUrl: '/assets/landing/doctor-chea-kimly.png',
      name: 'Dr. Chea Kimly',
      specialty: 'Orthodontist',
    },
    {
      imageAlt: 'Portrait of Dr. Taing Thanith',
      imageUrl: '/assets/landing/doctor-taing-thanith.png',
      name: 'Dr. Taing Thanith',
      specialty: 'General Dentist',
    },
    {
      imageAlt: 'Portrait of Dr. Yim Delux',
      imageUrl: '/assets/landing/doctor-yim-delux.png',
      name: 'Dr. Yim Delux',
      specialty: 'General Dentist',
    },
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
          { href: '#services', label: 'Orthodontic' },
          { href: '#services', label: 'Root Canal Treatment' },
          { href: '#services', label: 'Pediatric Dentistry' },
          { href: '#services', label: 'Dental Implant' },
          { href: '#services', label: 'Digital Smile Design' },
          { href: '#showcase', label: 'Showcase' },
        ],
      },
    ],
  },
};

export async function fetchLandingPage(): Promise<LandingPageContent> {
  return landingPageContent;
}
