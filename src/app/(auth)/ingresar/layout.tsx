import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false, follow: false },
};

export default function IngresarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
