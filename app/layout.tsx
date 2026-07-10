import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { UserProvider } from "@/contexts/UserContext";

export const metadata: Metadata = {
  title: "ABC Master Embalagens | Qualidade e Confiança em Embalagens",
  description: "ABC Master Embalagens Ltda. Soluções inteligentes em sacos plásticos PE e Zip Lock de alta performance. Compre online com entrega para todo o Brasil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <UserProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
