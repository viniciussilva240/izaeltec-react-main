import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

export const metadata = {
  title: "izaeltec-react",
  description: "Assitencia técnica em informática",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body style={{ display: 'flex' }}>
        <AuthGuard>
          <main style={{ flex: 1 }}>
            {children}
          </main>
        </AuthGuard>
      </body>
    </html>
  );
}
