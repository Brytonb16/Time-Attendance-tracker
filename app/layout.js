
import './globals.css';

export const metadata = {
  title: 'Time & Attendance Tracker',
  description: 'Disciplinary point tracker for attendance incidents'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
