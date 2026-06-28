// provider.tsx
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "./context/UserDetailContext";

export type UserDetail = {
  name: string;
  email: string;
  credits: number;
};

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState<any>(null);

  useEffect(() => {
    if (user) {
      CreateNewUser();
    }
  }, [user]);

  const CreateNewUser = async () => {
    try {
      const result = await axios.post("/api/users");
      console.log(result.data);
      setUserDetail(result.data); // store API response in state
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
}

export default Provider;
