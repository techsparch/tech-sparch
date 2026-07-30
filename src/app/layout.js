import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ProviderAuth from "@/helper/provider/ProviderAuth";
import QueryProvider from "@/lib/provider/QueryProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#061E29",
  formatDetection: {
    telephone: false,
  },
};

export const metadata = {
  metadataBase: new URL("https://www.techsparch.com"),
  title: {
    default:
      "TechSparch - CA Management Software for GST, Client Documents & Invoicing",
    template: "%s | TechSparch",
  },
  description:
    "TechSparch is a cloud-based CA management software that helps Chartered Accountants manage clients, GST documents, invoices, payments, secure cloud storage, and compliance from one platform.",
  keywords: [
    "CA Management Software",
    "Chartered Accountant Software",
    "Client Management Software",
    "CA Client Portal",
    "GST Management Software",
    "Income Tax Management Software",
    "Accounting Management Software",
    "Invoice Management Software",
    "Document Management System",
    "Cloud Document Storage",
    "Paperless CA Office",
    "Compliance Management Software",
    "Business Management Software",
    "Accounting Automation",
    "Digital Document Vault",
    "Client Dashboard",
    "Tax Filing Software",
    "Business Document Management",
    "Secure File Sharing",
    "Cloud Accounting Platform",
  ],
  authors: [
    {
      name: "Vedayana Technology Private Limited",
      url: "https://www.techsparch.com",
    },
  ],
  creator: "Vedayana Technology Private Limited",
  publisher: "Vedayana Technology Private Limited",
  category: "Business Software",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Updated icons section to use logo.jpeg
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/apple-touch-icon.png", // Kept this as PNG as Apple devices prefer it, but you can change it to /logo.jpeg if you wish
  },
  openGraph: {
    title: "TechSparch - Cloud CA & Client Management Software",
    description:
      "Manage clients, GST documents, invoices, payments, secure cloud storage, and accounting workflows with TechSparch.",
    url: "https://www.techsparch.com",
    siteName: "TechSparch",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "TechSparch - CA Management Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechSparch - Cloud CA Management Platform",
    description:
      "Paperless CA office with GST management, invoices, payments, secure document storage, and client collaboration.",
    images: ["/logo.jpeg"],
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TechSparch",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Accounting Software",
    operatingSystem: "Web, Android, iOS",
    url: "https://www.techsparch.com",
    image: "https://www.techsparch.com/logo.jpeg",
    description:
      "Cloud-based CA management software for GST management, secure document storage, invoice generation, client management, payment tracking, and compliance.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    publisher: {
      "@type": "Organization",
      name: "Vedayana Technology Private Limited",
      url: "https://www.techsparch.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.techsparch.com/logo.jpeg",
      },
    },
    featureList: [
      "Client Management",
      "Cloud Document Storage",
      "GST Management",
      "Invoice Generation",
      "Payment Tracking",
      "Role-Based Access",
      "Secure File Sharing",
      "Compliance Management",
      "Client Dashboard",
      "Paperless Office",
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased `}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <GoogleAnalytics gaId="G-D4S02C820P" />
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ProviderAuth>{children}</ProviderAuth>
        </QueryProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
