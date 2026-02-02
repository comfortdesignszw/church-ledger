import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://oywwkuucicnkkvezgkuc.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIyZDIxMGEwLTkxZjUtNGE4My1iMGE4LTAyOTMwNDg3MGFlNyJ9.eyJwcm9qZWN0SWQiOiJveXd3a3V1Y2ljbmtrdmV6Z2t1YyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcwMDI5NzUxLCJleHAiOjIwODUzODk3NTEsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.o-YCYEtwY8le2Ad1WfsEDWIHjqZ6QKinmwyYc_QZ3U4';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };