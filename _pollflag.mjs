import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });
const UID='4c1a469a-a8d9-4f40-b67b-5109c1c8eda8';
let last=null;
for (let i=0;i<40;i++){
  const { data } = await sb.from('subscriptions').select('status,cancel_at_period_end,current_period_end,updated_at').eq('user_id',UID);
  const r=data?.[0];
  if (r && r.cancel_at_period_end === true){
    console.log('FLAG SET ✓ — webhook recorded the cancellation:');
    console.log(JSON.stringify(r,null,2));
    process.exit(0);
  }
  if (r && r.updated_at!==last){ last=r.updated_at; console.log(`t${i}: cancel_at_period_end=${r.cancel_at_period_end}, updated_at=${r.updated_at}`); }
  await new Promise(res=>setTimeout(res,15000));
}
console.log('No change to true after ~10 min.');
