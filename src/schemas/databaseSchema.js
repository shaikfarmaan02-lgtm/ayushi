/**
 * Ayushi Healthcare Application - NoSQL Database Schema
 * 
 * This file defines the schema structure for the Supabase NoSQL database.
 * It serves as documentation for developers to understand the data structure.
 */

// Users Collection
const usersSchema = {
  id: 'UUID (primary key, auto-generated)',
  email: 'string (unique)',
  first_name: 'string',
  last_name: 'string',
  role: 'string (patient, doctor, admin)',
  profile_image: 'string (URL)',
  phone_number: 'string',
  date_of_birth: 'timestamp',
  gender: 'string',
  address: {
    street: 'string',
    city: 'string',
    state: 'string',
    postal_code: 'string',
    country: 'string'
  },
  created_at: 'timestamp',
  updated_at: 'timestamp',
  last_login: 'timestamp',
  is_active: 'boolean',
  settings: {
    notification_preferences: 'object',
    theme_preference: 'string',
    language_preference: 'string'
  }
};

// Patient Profiles Collection
const patientProfilesSchema = {
  id: 'UUID (primary key)',
  user_id: 'UUID (foreign key to users)',
  emergency_contact: {
    name: 'string',
    relationship: 'string',
    phone: 'string'
  },
  blood_type: 'string',
  height: 'number',
  weight: 'number',
  allergies: ['string'],
  chronic_conditions: ['string'],
  current_medications: [{
    name: 'string',
    dosage: 'string',
    frequency: 'string',
    start_date: 'timestamp'
  }],
  family_medical_history: ['string'],
  lifestyle: {
    smoking: 'boolean',
    alcohol_consumption: 'string',
    exercise_frequency: 'string',
    diet: 'string'
  },
  insurance: {
    provider: 'string',
    policy_number: 'string',
    group_number: 'string',
    coverage_start_date: 'timestamp',
    coverage_end_date: 'timestamp'
  },
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

// Doctor Profiles Collection
const doctorProfilesSchema = {
  id: 'UUID (primary key)',
  user_id: 'UUID (foreign key to users)',
  specialties: ['string'],
  qualifications: [{
    degree: 'string',
    institution: 'string',
    year: 'number'
  }],
  license_number: 'string',
  years_of_experience: 'number',
  hospital_affiliations: ['string'],
  languages_spoken: ['string'],
  consultation_fee: 'number',
  available_days: ['string'],
  available_hours: {
    start: 'string (HH:MM)',
    end: 'string (HH:MM)'
  },
  average_rating: 'number',
  total_reviews: 'number',
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

// Appointments Collection
const appointmentsSchema = {
  id: 'UUID (primary key)',
  patient_id: 'UUID (foreign key to users)',
  doctor_id: 'UUID (foreign key to users)',
  appointment_date: 'timestamp',
  end_time: 'timestamp',
  status: 'string (scheduled, completed, cancelled, no-show)',
  type: 'string (in-person, video, phone)',
  reason: 'string',
  notes: 'string',
  follow_up_required: 'boolean',
  follow_up_date: 'timestamp',
  created_at: 'timestamp',
  updated_at: 'timestamp',
  cancelled_by: 'string (patient, doctor, system)',
  cancellation_reason: 'string',
  reminder_sent: 'boolean',
  payment_status: 'string (pending, completed, refunded)',
  payment_amount: 'number',
  insurance_claim_status: 'string'
};

// Medical Records Collection
const medicalRecordsSchema = {
  id: 'UUID (primary key)',
  patient_id: 'UUID (foreign key to users)',
  record_type: 'string (visit, lab, imaging, procedure, vaccination, etc.)',
  title: 'string',
  description: 'string',
  record_date: 'timestamp',
  provider: 'string',
  location: 'string',
  diagnosis: ['string'],
  symptoms: ['string'],
  treatments: ['string'],
  medications_prescribed: [{
    name: 'string',
    dosage: 'string',
    frequency: 'string',
    duration: 'string',
    instructions: 'string'
  }],
  vital_signs: {
    blood_pressure: 'string',
    heart_rate: 'number',
    respiratory_rate: 'number',
    temperature: 'number',
    oxygen_saturation: 'number'
  },
  lab_results: [{
    test_name: 'string',
    result: 'string',
    unit: 'string',
    reference_range: 'string',
    is_abnormal: 'boolean'
  }],
  imaging_results: [{
    type: 'string',
    findings: 'string',
    impression: 'string',
    image_url: 'string'
  }],
  attachments: [{
    id: 'string',
    name: 'string',
    type: 'string',
    size: 'number',
    url: 'string',
    uploaded_at: 'timestamp'
  }],
  doctor_id: 'UUID (foreign key to users)',
  follow_up_instructions: 'string',
  created_at: 'timestamp',
  updated_at: 'timestamp',
  schema_version: 'number'
};

// Prescriptions Collection
const prescriptionsSchema = {
  id: 'UUID (primary key)',
  patient_id: 'UUID (foreign key to users)',
  doctor_id: 'UUID (foreign key to users)',
  issue_date: 'timestamp',
  expiry_date: 'timestamp',
  status: 'string (active, completed, expired)',
  medications: [{
    name: 'string',
    dosage: 'string',
    frequency: 'string',
    duration: 'string',
    quantity: 'number',
    refills: 'number',
    refills_used: 'number',
    instructions: 'string',
    side_effects: ['string'],
    is_controlled_substance: 'boolean'
  }],
  pharmacy: {
    name: 'string',
    address: 'string',
    phone: 'string',
    email: 'string'
  },
  notes: 'string',
  created_at: 'timestamp',
  updated_at: 'timestamp',
  last_filled_date: 'timestamp',
  prescription_image_url: 'string'
};

// Medication Adherence Collection
const medicationAdherenceSchema = {
  id: 'UUID (primary key)',
  patient_id: 'UUID (foreign key to users)',
  prescription_id: 'UUID (foreign key to prescriptions)',
  medication_name: 'string',
  scheduled_time: 'timestamp',
  taken_time: 'timestamp',
  status: 'string (taken, missed, taken_late)',
  notes: 'string',
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

// Reviews Collection
const reviewsSchema = {
  id: 'UUID (primary key)',
  patient_id: 'UUID (foreign key to users)',
  doctor_id: 'UUID (foreign key to users)',
  appointment_id: 'UUID (foreign key to appointments)',
  rating: 'number (1-5)',
  review_text: 'string',
  is_anonymous: 'boolean',
  created_at: 'timestamp',
  updated_at: 'timestamp',
  is_published: 'boolean',
  helpful_votes: 'number',
  response: {
    text: 'string',
    responded_at: 'timestamp'
  }
};

// Notifications Collection
const notificationsSchema = {
  id: 'UUID (primary key)',
  user_id: 'UUID (foreign key to users)',
  type: 'string (appointment_reminder, prescription_refill, lab_result, etc.)',
  title: 'string',
  message: 'string',
  is_read: 'boolean',
  action_url: 'string',
  created_at: 'timestamp',
  expires_at: 'timestamp',
  priority: 'string (low, normal, high)'
};

// Chat Messages Collection
const chatMessagesSchema = {
  id: 'UUID (primary key)',
  conversation_id: 'UUID',
  sender_id: 'UUID (foreign key to users)',
  receiver_id: 'UUID (foreign key to users)',
  message: 'string',
  attachments: [{
    id: 'string',
    name: 'string',
    type: 'string',
    size: 'number',
    url: 'string'
  }],
  is_read: 'boolean',
  read_at: 'timestamp',
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

// AI Assistant Interactions Collection
const aiAssistantInteractionsSchema = {
  id: 'UUID (primary key)',
  user_id: 'UUID (foreign key to users)',
  query: 'string',
  response: 'string',
  feedback: 'string (helpful, not_helpful)',
  created_at: 'timestamp',
  session_id: 'string',
  context: 'object'
};

// Export all schemas
export const schemas = {
  users: usersSchema,
  patientProfiles: patientProfilesSchema,
  doctorProfiles: doctorProfilesSchema,
  appointments: appointmentsSchema,
  medicalRecords: medicalRecordsSchema,
  prescriptions: prescriptionsSchema,
  medicationAdherence: medicationAdherenceSchema,
  reviews: reviewsSchema,
  notifications: notificationsSchema,
  chatMessages: chatMessagesSchema,
  aiAssistantInteractions: aiAssistantInteractionsSchema
};

export default schemas;