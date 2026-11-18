import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// post data to users table
export async function POST() {
     try{
          const user = await currentUser();
          if(!user){
               return NextResponse.json({error:"Unauthorized"},{status:401});
          }
          const email =user.emailAddresses[0]?.emailAddress || '';
          const name=`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
          const {data, error}=await supabase.from('users')
          .upsert({
               clerk_id:user.id,
               name,email,
               profile_image:user.imageUrl,
          },{
               onConflict:'clerk_id'
          })
          .select()
          .single();

          if(error){
               return NextResponse.json({error:error.message},{status:500});
          }

          return NextResponse.json({user:data},{status:200});
     }
     catch(error){
          return NextResponse.json({error:"Internal Sever Error"},{status:500});
     }
}

// fetch current user data from users table
export async function GET(){

     const user=await currentUser();
     if(!user){
          return NextResponse.json({user:[]},{status:200});
     }
          

     const {data,error}=await supabase.from('users').select('*').eq('clerk_id',user.id).single();
     if(error){
          return NextResponse.json({error:error.message},{status:500});
     }
     return NextResponse.json({user:data},{status:200});
}

// update user role whether is ride or driver and phone number 
export async function PATCH(request:Request){
     try{
          const user=await currentUser();
          if(!user){
               return NextResponse.json({error:'Unauthorized'},{status:401});
          }
          const body=await request.json();
          const {role,phone}=body;

          const updates:Record<string,string>={};
          if(role === 'rider' || role === 'driver') updates.role=role;
          if(typeof phone === 'string') updates.phone=phone;

          const {data,error}=await supabase
          .from('users')
          .update(updates)
          .eq('clerk_id',user.id)
          .select()
          .single();

          if(error){
               return NextResponse.json({error:error.message},{status:500});
          }
          // if everything is fine
          return NextResponse.json({user:data},{status:200});
     }
     catch(error){
          return NextResponse.json({error:"Internal Sever Error"},{status:500});
     }
}
