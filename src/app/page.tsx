"use client"
import { UserButton } from "@/features/auth/components/user-button";
import { useAuthActions } from "@convex-dev/auth/react";
import { User } from "lucide-react";


export default function Home() {

  const { signOut } = useAuthActions();
  
  return (
    <div>
      <UserButton/>
    </div>
    
  );
}
