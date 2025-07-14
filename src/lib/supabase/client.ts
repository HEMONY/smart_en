import { createClient } from '@supabase/supabase-js';

//const supabaseUrl = 'https://aqunpkwwvslnmuqvotyl.supabase.co';
//const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdW5wa3d3dnNsbm11cXZvdHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NDAyODQsImV4cCI6MjA2MTAxNjI4NH0.FgbKG2DyKL7Ob6fIfwaC43_jAphP7YG2D61IgIIVHpo';
const supabaseUrl = 'https://xsxbeihsavosrxjyzmga.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzeGJlaWhzYXZvc3J4anl6bWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NjI2ODEsImV4cCI6MjA2NzEzODY4MX0.79iTU8QrexMFSrg_CesL_vOSwQ0TWxq3iN8TsVDWE-o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
