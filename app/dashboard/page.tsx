'use client';

import { useEffect } from "react";
import { useUser,UserButton, UserProfile } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

interface UserProfile{
     id:string;
     clerk_id:string;
     name:string;
     email:string;
     phone:string | '';
     role:'rider' | 'driver';
     profile_img:string |null;
}


export default function DashBoardPage(){
     // useState is use to store and update data dynamically
     // syntax onst [current value, setA a function to update ]=useSate(can be falsy value such as 0,'',false)
     const {isLoaded, isSignedIn,user}=useUser();
     const [profile, setProfile]=useState<UserProfile | null>(null);
     const [phone, setPhone]=useState('');
     const [loading, setLoading]=useState(true);
     const [saving, setSaving]=useState(false);
     const [message, setMessage]=useState('');

     // sync clerk user
     useEffect(()=>{
          if(!isLoaded || !isSignedIn) return;
          const syncProfile=async()=>{
               try{
                    // res=respone
                    const res=await fetch('/api/users',{method:'POST'});
                    const data=await res.json();
                    if(data.user){
                         setProfile(data.user);
                         setPhone(data.user.phone || '');
                    }

               }catch(error){
                    console.error("Failed to sync user profile:",error);
               }
               finally{
                    setLoading(false);
               }
          };
          syncProfile();
     },[isLoaded,isSignedIn]);

     const handleRoleChange=async (newRole:'rider' | 'driver')=>{
          if(!profile || profile.role === newRole){
               return;
          }
          setSaving(true);
          setMessage('');

          try{
               const res=await fetch('/api/users',{
                    method:'PATCH',
                    headers:{
                         'Content-Type':'application/json'
                    },
                    body:JSON.stringify({phone}),

               });
               const data=await res.json();
               if(data.user){
                    setProfile(data.user);
                    setMessage('Phone number updated!');
               }

          }
          catch(error){
               setMessage('Error updaing phone number.');
          }finally{
               setSaving(false);
          }
     };

     if(!isLoaded || loading){
          // interface
          return(
               <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                    <p className="text-zinc-600 dark:text-zinc-400">Loading your dashboard.....</p>
               </div>
          );
     }

     if(!isSignedIn){
          return(
              <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc dark:bg-zinc-950">
               <p className="text-lg font-medium">Please sign in to access dashboard</p>
               <Link href="/sign-in" className="rounded-lg bg-black px-5 py-2.5 text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
                    Sign In
               </Link>
              </div> 
          );
     }


     // main

     
}