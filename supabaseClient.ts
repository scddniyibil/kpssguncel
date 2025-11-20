
import { createClient } from '@supabase/supabase-js';

// ÖNEMLİ: Bu değerleri process.env.SUPABASE_URL ve process.env.SUPABASE_ANON_KEY 
// olarak alıyoruz. Eğer çalışmazsa manuel olarak string içine yazabilirsiniz.
const supabaseUrl = process.env.SUPABASE_URL || 'https://lnbxmqudfvtoftgaaovh.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuYnhtcXVkZnZ0b2Z0Z2Fhb3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzUxODcsImV4cCI6MjA3OTIxMTE4N30.S5OTWqbPkzcGqsdBXJsURlF6Vz-zPmzefZYovY0jOKs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
