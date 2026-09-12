"use client";

import { PayslipsProvider } from "@/context/PayslipsContext";

export default function Providers({ children }) {
  return <PayslipsProvider>{children}</PayslipsProvider>;
}
