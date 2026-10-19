import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShopFlow - Nền Tảng Tự Động Hóa Fanpage Facebook & Bán Hàng Online',
  description:
    'Hệ thống tự động hóa Fanpage: Chatbot AI đa kênh, Lên lịch đăng bài thông minh, Khiên bảo vệ ẩn số điện thoại chống cướp đơn và CRM quản trị khách hàng.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-blueprint-grid antialiased">{children}</body>
    </html>
  );
}
