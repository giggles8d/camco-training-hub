import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://pefmgoebjwsjrmetjmvy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZm1nb2ViandzanJtZXRqbXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjEwOTgsImV4cCI6MjA4ODg5NzA5OH0.6Np9ddUVyMDSh8cGirh_8iUmr3f6qiGmTHpwgDTjoRk'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

---

**File 6: `public/_redirects`**
```
/*    /index.html   200
