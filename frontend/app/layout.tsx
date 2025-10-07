export const metadata = {
  title: "ShieldPool",
  description: "Privacy-preserving insurance pool using Zama FHEVM",
};

import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black min-h-screen text-white">
        <div className="max-w-screen-xl mx-auto w-full"><Providers>{children}</Providers></div>
      </body>
    </html>
  );
}


