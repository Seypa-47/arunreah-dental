/** Interface copy for the staff profile page, shared by both layouts. */
export function profileCopy(language: 'en' | 'km', name: string) {
  const isKm = language === 'km';
  return {
    backToTeam: isKm ? 'ត្រឡប់ទៅក្រុមការងារ' : 'Back to Our Team',
    notFoundBadge: isKm ? 'គ្មានប្រវត្តិរូប' : 'No profile',
    notFoundBody: isKm
      ? 'សូមត្រឡប់ទៅទំព័រក្រុមការងារ ហើយជ្រើសរើសប្រវត្តិរូបផ្សេង។'
      : 'Please return to the team page and choose another profile.',
    notFoundTitle: isKm ? 'ប្រវត្តិរូបនេះមិនមានទេ' : 'This profile is unavailable',
    others: isKm ? 'សមាជិកផ្សេងទៀតក្នុងក្រុមនេះ' : 'More from this team',
    othersBody: isKm
      ? 'ស្វែងយល់បន្ថែមអំពីក្រុមការងារដែលថែទាំអ្នក។'
      : 'Meet more of the team supporting your care.',
    viewTeam: isKm ? 'មើលក្រុមការងារទាំងអស់' : 'View Our Team',

    // Clinical layout
    about: isKm ? 'អំពីគ្រូពេទ្យ' : 'About the Practitioner',
    appointment: isKm ? 'ស្នើសុំការពិគ្រោះយោបល់' : 'Request a Consultation',
    appointmentBody: isKm
      ? `ផ្ញើសំណើ ដើម្បីជួបពិគ្រោះជាមួយ ${name} នៅគ្លីនិក។`
      : `Send a request to arrange a consultation with ${name} at the clinic.`,
    areas: isKm ? 'វិស័យនៃការថែទាំវេជ្ជសាស្ត្រ' : 'Areas of Medical Care',
    areasEyebrow: isKm ? 'វិសាលភាពនៃការថែទាំ' : 'Scope of care',
    experience: isKm ? 'បទពិសោធន៍វិជ្ជាជីវៈ' : 'Professional Experience',
    experienceEyebrow: isKm ? 'ផ្ទៃខាងក្រោយ' : 'Background',
    profileEyebrow: isKm ? 'ប្រវត្តិវិជ្ជាជីវៈ' : 'Professional profile',
    qualifications: isKm ? 'ការសិក្សា និងគុណវុឌ្ឍិវេជ្ជសាស្ត្រ' : 'Education & Medical Qualifications',
    qualificationsEyebrow: isKm ? 'គុណវុឌ្ឍិ និងការបណ្តុះបណ្តាល' : 'Qualifications & training',
    requestAppointment: isKm ? 'ស្នើសុំការណាត់ជួប' : 'Request Appointment',

    // Support layout — clinical assistants
    aboutAssistant: isKm ? 'អំពីជំនួយការ' : 'About the Assistant',
    clinicalSupport: isKm ? 'ភារកិច្ចជំនួយការព្យាបាល' : 'Clinical Support Responsibilities',
    clinicalSupportEyebrow: isKm ? 'ក្នុងបន្ទប់ព្យាបាល' : 'In the treatment room',
    department: isKm ? 'ផ្នែក' : 'Department',
    teamConnection: isKm ? 'ការងាររួមជាមួយក្រុមព្យាបាល' : 'Working with Our Clinical Team',
    teamConnectionEyebrow: isKm ? 'ក្រុមព្យាបាល' : 'Clinical team',
    training: isKm ? 'ការបណ្តុះបណ្តាល និងជំនាញវិជ្ជាជីវៈ' : 'Training & Professional Skills',
    trainingEyebrow: isKm ? 'ការបណ្តុះបណ្តាល' : 'Training',
    viewDentists: isKm ? 'មើលទន្តបណ្ឌិតរបស់យើង' : 'View our dentists',

    // Support layout — reception
    contactClinic: isKm ? 'ទាក់ទងគ្លីនិករបស់យើង' : 'Contact Our Clinic',
    help: isKm ? 'របៀបដែលខ្ញុំជួយអ្នកជំងឺ' : 'How I Help Patients',
    helpEyebrow: isKm ? 'ការងារប្រចាំថ្ងៃ' : 'Day to day',
    languages: isKm ? 'ភាសា និងទំនាក់ទំនង' : 'Languages & Communication',
    languagesBody: isKm
      ? 'ភាសាដែលអ្នកអាចប្រើនៅពេលនិយាយជាមួយកន្លែងទទួលភ្ញៀវ។'
      : 'Languages you can use when speaking with the reception desk.',
    languagesEyebrow: isKm ? 'ទំនាក់ទំនង' : 'Communication',
    meet: isKm ? `ជួបជាមួយ ${name}` : `Meet ${name}`,
    meetEyebrow: isKm ? 'ប្រវត្តិសមាជិកក្រុម' : 'Team profile',
    visitBody: isKm
      ? 'ក្រុមទទួលភ្ញៀវរបស់យើងអាចជួយអ្នកក្នុងការណាត់ជួប ការរកទីតាំង និងសំណួរទូទៅអំពីដំណើរមកគ្លីនិករបស់អ្នក។'
      : 'Our reception team can help with appointments, directions, and general questions about your visit.',
    visitTitle: isKm
      ? 'ត្រូវការជំនួយក្នុងការរៀបចំដំណើរមកគ្លីនិក?'
      : 'Need Help Planning Your Visit?',
  };
}
