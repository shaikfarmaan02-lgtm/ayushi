import { supabaseClient } from './supabase';

// NoSQL-style schema for medical records
// This service handles all medical record operations using Supabase as a NoSQL database

/**
 * Medical Records Service
 * 
 * This service provides functions to manage medical records in a NoSQL structure
 * Records are stored with flexible schemas to accommodate different types of medical data
 */
const medicalRecordsService = {
  /**
   * Get all medical records for a patient
   * @param {string} patientId - The patient's ID
   * @returns {Promise<Array>} - Array of medical records
   */
  async getPatientRecords(patientId) {
    const { data, error } = await supabaseClient
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a specific medical record by ID
   * @param {string} recordId - The record ID
   * @returns {Promise<Object>} - The medical record
   */
  async getRecordById(recordId) {
    const { data, error } = await supabaseClient
      .from('medical_records')
      .select('*')
      .eq('id', recordId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new medical record
   * @param {Object} recordData - The record data
   * @returns {Promise<Object>} - The created record
   */
  async createRecord(recordData) {
    // Add metadata for NoSQL-style document
    const record = {
      ...recordData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Add document type for flexible schema support
      record_type: recordData.record_type || 'general',
      // Add version for schema evolution
      schema_version: 1
    };

    const { data, error } = await supabaseClient
      .from('medical_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update an existing medical record
   * @param {string} recordId - The record ID
   * @param {Object} recordData - The updated record data
   * @returns {Promise<Object>} - The updated record
   */
  async updateRecord(recordId, recordData) {
    // Update metadata
    const updates = {
      ...recordData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from('medical_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a medical record
   * @param {string} recordId - The record ID
   * @returns {Promise<void>}
   */
  async deleteRecord(recordId) {
    const { error } = await supabaseClient
      .from('medical_records')
      .delete()
      .eq('id', recordId);
    
    if (error) throw error;
  },

  /**
   * Search medical records by various criteria
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} - Array of matching records
   */
  async searchRecords(searchParams) {
    let query = supabaseClient
      .from('medical_records')
      .select('*');
    
    // Apply filters based on search parameters
    if (searchParams.patientId) {
      query = query.eq('patient_id', searchParams.patientId);
    }
    
    if (searchParams.recordType) {
      query = query.eq('record_type', searchParams.recordType);
    }
    
    if (searchParams.provider) {
      query = query.ilike('provider', `%${searchParams.provider}%`);
    }
    
    if (searchParams.dateFrom) {
      query = query.gte('record_date', searchParams.dateFrom);
    }
    
    if (searchParams.dateTo) {
      query = query.lte('record_date', searchParams.dateTo);
    }
    
    if (searchParams.keyword) {
      query = query.or(`title.ilike.%${searchParams.keyword}%,description.ilike.%${searchParams.keyword}%`);
    }
    
    // Order by date
    query = query.order('record_date', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  /**
   * Get records by category
   * @param {string} patientId - The patient's ID
   * @param {string} category - The record category
   * @returns {Promise<Array>} - Array of records in the category
   */
  async getRecordsByCategory(patientId, category) {
    const { data, error } = await supabaseClient
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .eq('category', category)
      .order('record_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Get the latest records for a patient
   * @param {string} patientId - The patient's ID
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} - Array of latest records
   */
  async getLatestRecords(patientId, limit = 5) {
    const { data, error } = await supabaseClient
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('record_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  /**
   * Add an attachment to a medical record
   * @param {string} recordId - The record ID
   * @param {File} file - The file to attach
   * @returns {Promise<Object>} - The attachment metadata
   */
  async addAttachment(recordId, file) {
    // Upload file to storage
    const filePath = `medical_records/${recordId}/${file.name}`;
    const { error: uploadError } = await supabaseClient
      .storage
      .from('attachments')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('attachments')
      .getPublicUrl(filePath);
    
    // Update record with attachment metadata
    const { data: record } = await supabaseClient
      .from('medical_records')
      .select('attachments')
      .eq('id', recordId)
      .single();
    
    const attachments = record.attachments || [];
    const newAttachment = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: publicUrl,
      uploaded_at: new Date().toISOString()
    };
    
    const { data, error } = await supabaseClient
      .from('medical_records')
      .update({
        attachments: [...attachments, newAttachment],
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId)
      .select()
      .single();
    
    if (error) throw error;
    return newAttachment;
  },

  /**
   * Get medical record statistics for a patient
   * @param {string} patientId - The patient's ID
   * @returns {Promise<Object>} - Statistics about the patient's records
   */
  async getRecordStatistics(patientId) {
    const { data, error } = await supabaseClient
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId);
    
    if (error) throw error;
    
    // Calculate statistics
    const recordsByType = {};
    const recordsByYear = {};
    const recordsByProvider = {};
    
    data.forEach(record => {
      // Count by type
      recordsByType[record.record_type] = (recordsByType[record.record_type] || 0) + 1;
      
      // Count by year
      const year = new Date(record.record_date).getFullYear();
      recordsByYear[year] = (recordsByYear[year] || 0) + 1;
      
      // Count by provider
      if (record.provider) {
        recordsByProvider[record.provider] = (recordsByProvider[record.provider] || 0) + 1;
      }
    });
    
    return {
      totalRecords: data.length,
      recordsByType,
      recordsByYear,
      recordsByProvider,
      latestRecord: data.sort((a, b) => new Date(b.record_date) - new Date(a.record_date))[0]
    };
  }
};

export default medicalRecordsService;