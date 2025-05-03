"use client";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

type ClientBodyProps = {
  children: ReactNode;
};

const ClientBody = ({ children }: ClientBodyProps) => {
  return (
    <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
      {children}
      <Toaster />
    </ThemeProvider>
  );
};

export default ClientBody;
