import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Validate environment variables
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Using fallback values for development. Please check your .env file for production.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication services
export const authService = {
  // Register a new user
  register: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData
        }
      }
    });
    
    if (error) throw error;
    
    // If registration successful, create user profile in the database
    if (data?.user) {
      await supabase
        .from('user_profiles')
        .insert([
          {
            id: data.user.id,
            email: email,
            role: userData.role,
            full_name: userData.fullName,
            created_at: new Date(),
            ...userData
          }
        ]);
    }
    
    return data;
  },
  
  // Login user
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Get user profile data
    if (data?.user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      return {
        user: {
          ...data.user,
          ...profileData
        },
        session: data.session
      };
    }
    
    return data;
  },
  
  // Logout user
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Get user profile data
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return {
      ...user,
      ...profileData
    };
  },
  
  // Update user profile
  updateProfile: async (userId, userData) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(userData)
      .eq('id', userId);
      
    if (error) throw error;
    return data;
  }
};

// Appointments services
export const appointmentService = {
  // Create a new appointment
  createAppointment: async (appointmentData) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Get appointments for a user (patient or doctor)
  getUserAppointments: async (userId, role) => {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patient_id(*),
        doctor:doctor_id(*)
      `);
      
    if (role === 'patient') {
      query = query.eq('patient_id', userId);
    } else if (role === 'doctor') {
      query = query.eq('doctor_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },
  
  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Get appointment by ID
  getAppointmentById: async (appointmentId) => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patient_id(*),
        doctor:doctor_id(*)
      `)
      .eq('id', appointmentId)
      .single();
      
    if (error) throw error;
    return data;
  }
};

// Prescription services
export const prescriptionService = {
  // Create a new prescription
  createPrescription: async (prescriptionData) => {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([prescriptionData])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Get prescriptions for a patient
  getPatientPrescriptions: async (patientId) => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        doctor:doctor_id(*),
        prescription_items(*)
      `)
      .eq('patient_id', patientId);
      
    if (error) throw error;
    return data;
  },
  
  // Get prescriptions created by a doctor
  getDoctorPrescriptions: async (doctorId) => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patient_id(*),
        prescription_items(*)
      `)
      .eq('doctor_id', doctorId);
      
    if (error) throw error;
    return data;
  },
  
  // Get prescription by ID
  getPrescriptionById: async (prescriptionId) => {
    const { data, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patient_id(*),
        doctor:doctor_id(*),
        prescription_items(*)
      `)
      .eq('id', prescriptionId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Add items to prescription
  addPrescriptionItems: async (prescriptionId, items) => {
    const prescriptionItems = items.map(item => ({
      prescription_id: prescriptionId,
      ...item
    }));
    
    const { data, error } = await supabase
      .from('prescription_items')
      .insert(prescriptionItems)
      .select();
      
    if (error) throw error;
    return data;
  },
  
  // Get prescription analytics for a patient
  getPatientPrescriptionAnalytics: async (patientId) => {
    // Get all prescriptions for the patient
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select(`
        *,
        prescription_items(*)
      `)
      .eq('patient_id', patientId);
      
    if (prescriptionsError) throw prescriptionsError;
    
    // Process the data to get analytics
    const medications = {};
    const prescriptionsByMonth = {};
    
    prescriptions.forEach(prescription => {
      // Count medications
      prescription.prescription_items.forEach(item => {
        if (medications[item.medication_name]) {
          medications[item.medication_name].count += 1;
        } else {
          medications[item.medication_name] = {
            count: 1,
            dosage: item.dosage,
            frequency: item.frequency
          };
        }
      });
      
      // Group by month
      const date = new Date(prescription.created_at);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (prescriptionsByMonth[monthYear]) {
        prescriptionsByMonth[monthYear] += 1;
      } else {
        prescriptionsByMonth[monthYear] = 1;
      }
    });
    
    return {
      totalPrescriptions: prescriptions.length,
      medications: Object.keys(medications).map(name => ({
        name,
        ...medications[name]
      })),
      prescriptionsByMonth: Object.keys(prescriptionsByMonth).map(month => ({
        month,
        count: prescriptionsByMonth[month]
      }))
    };
  }
};

// Medical records services
export const medicalRecordService = {
  // Create a new medical record
  createMedicalRecord: async (recordData) => {
    const { data, error } = await supabase
      .from('medical_records')
      .insert([recordData])
      .select();
      
    if (error) throw error;
    return data[0];
  },
  
  // Get medical records for a patient
  getPatientMedicalRecords: async (patientId) => {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        doctor:doctor_id(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },
  
  // Get medical record by ID
  getMedicalRecordById: async (recordId) => {
    const { data, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patient_id(*),
        doctor:doctor_id(*)
      `)
      .eq('id', recordId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Update medical record
  updateMedicalRecord: async (recordId, recordData) => {
    const { data, error } = await supabase
      .from('medical_records')
      .update(recordData)
      .eq('id', recordId)
      .select();
      
    if (error) throw error;
    return data[0];
  }
};

// Drug information services
export const drugInfoService = {
  // Search for drug information
  searchDrugInfo: async (query) => {
    const { data, error } = await supabase
      .from('drug_database')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);
      
    if (error) throw error;
    return data;
  },
  
  // Get drug details by ID
  getDrugById: async (drugId) => {
    const { data, error } = await supabase
      .from('drug_database')
      .select('*')
      .eq('id', drugId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Check drug interactions
  checkDrugInteractions: async (drugIds) => {
    const { data, error } = await supabase
      .from('drug_interactions')
      .select('*')
      .in('drug_id_1', drugIds)
      .in('drug_id_2', drugIds);
      
    if (error) throw error;
    return data;
  }
};

// Doctors and specialties services
export const doctorService = {
  // Get all doctors
  getAllDoctors: async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'doctor');
      
    if (error) throw error;
    return data;
  },
  
  // Get doctors by specialty
  getDoctorsBySpecialty: async (specialtyId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'doctor')
      .eq('specialty_id', specialtyId);
      
    if (error) throw error;
    return data;
  },
  
  // Get all specialties
  getAllSpecialties: async () => {
    const { data, error } = await supabase
      .from('specialties')
      .select('*');
      
    if (error) throw error;
    return data;
  },
  
  // Get doctor availability
  getDoctorAvailability: async (doctorId, date) => {
    const { data, error } = await supabase
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .gte('date', date)
      .lte('date', new Date(new Date(date).setDate(new Date(date).getDate() + 7)).toISOString().split('T')[0]);
      
    if (error) throw error;
    return data;
  }
};