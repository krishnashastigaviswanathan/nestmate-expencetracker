import "./globals.css";

export const metadata = {
  title: "NestMate",
  description: "Shared roommate & household expense splitter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}