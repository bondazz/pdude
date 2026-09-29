import React from 'react';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pornhub.net.co'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
