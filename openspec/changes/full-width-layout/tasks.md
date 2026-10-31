# Tasks: Chuyển Đổi Giao Diện Dashboard Sang Full-Width (Tràn 100% Màn Hình)

## 1. Tái Cấu Trúc Khung Layout Cha (Full-Width Shell Layout)

- [x] 1.1 Cập nhật `frontend/src/components/layout/mac-window-shell.tsx`: Chuyển đổi khung ngoài thành `h-screen w-full flex flex-col overflow-hidden bg-white`, gỡ bỏ `max-w-[1560px]`, `min-h-[92vh]`, `p-2 sm:p-4 md:p-6`, `bg-blueprint-grid`, `rounded-[24px]`, viền `border` và bóng đổ `shadow-mac-window`.
- [x] 1.2 Tái cấu trúc thanh tiêu đề macOS Header trong `mac-window-shell.tsx`: Trải dài toàn bộ mép trên cùng của màn hình (`w-full h-10 border-b border-slate-200/80 px-4`), hỗ trợ Fullscreen API trên nút maximize.
- [x] 1.3 Cập nhật `frontend/src/app/(dashboard)/layout.tsx`: Đồng bộ hóa trạng thái tải `min-h-screen bg-slate-50` mượt mà khi kiểm tra phiên đăng nhập.

## 2. Loại Bỏ Container Giới Hạn Chiều Rộng Tại Các Trang Nghiệp Vụ

- [x] 2.1 Cập nhật `frontend/src/app/(dashboard)/analytics/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, thay bằng `w-full space-y-6`, cho phép biểu đồ SVG Bézier và Heatmap 24x7 hiển thị tràn 100% canvas.
- [x] 2.2 Cập nhật `frontend/src/app/(dashboard)/automation/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, thay bằng `flex-1 space-y-6 w-full animate-in fade-in duration-200`, dàn trải Bento metrics và danh sách kịch bản toàn màn hình.
- [x] 2.3 Cập nhật `frontend/src/app/(dashboard)/customers/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, thay bằng `flex-1 flex flex-col space-y-6 w-full select-none`, mở rộng bảng dữ liệu CRM và bộ 4 thẻ KPI.
- [x] 2.4 Cập nhật `frontend/src/app/(dashboard)/pages/page.tsx`: Gỡ bỏ `max-w-[1400px] mx-auto`, thay bằng `w-full space-y-6`, dàn đều lưới Fanpage cards.
- [x] 2.5 Cập nhật `frontend/src/app/(dashboard)/posts/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, thay bằng `flex-1 space-y-6 w-full`, mở rộng danh sách bài viết và lưới lịch Calendar View.
- [x] 2.6 Cập nhật `frontend/src/app/(dashboard)/posts/new/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, thay bằng `flex-1 space-y-6 w-full`, tối ưu không gian soạn thảo Split-Pane đa ảnh và sticky Live Preview.
- [x] 2.7 Kiểm tra và đồng bộ trang `frontend/src/app/(dashboard)/page.tsx` và `frontend/src/app/(dashboard)/orders/page.tsx`: Đảm bảo toàn bộ các thành phần hiển thị dạng `w-full` không bị giật lề hoặc co cụm.

## 3. Kiểm Thử Giao Diện & Thẩm Định Chất Lượng (Verification & Quality Gates)

- [x] 3.1 Chạy toàn bộ test suites frontend `npm test` và cập nhật các assertions nếu có kiểm tra class container cũ.
- [x] 3.2 Kiểm tra biên dịch tĩnh TypeScript `npx tsc --noEmit -p frontend/tsconfig.json` đạt 0 lỗi.
- [x] 3.3 Chạy Next.js production build `npm run build:frontend` xác nhận toàn bộ các route biên dịch tối ưu không lỗi.
- [x] 3.4 Chạy lệnh audit bộ nhớ `npm run memory:check` đạt 100% PASS theo quy chuẩn dự án.
