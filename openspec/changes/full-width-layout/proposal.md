# Proposal: Chuyển Đổi Giao Diện Dashboard Sang Full-Width (Tràn 100% Màn Hình)

## Why

Hiện tại, toàn bộ giao diện quản trị của ShopFlow đang bị đóng khung bên trong một cửa sổ giả lập macOS lơ lửng ở giữa màn hình với kích thước giới hạn cố định (`max-w-[1560px]`, `min-h-[92vh]`, viền padding ngoài `p-2 sm:p-4 md:p-6`) trên nền blueprint grid. Thêm vào đó, bên trong từng trang con (`/analytics`, `/automation`, `/customers`, `/pages`, `/posts`, `/posts/new`), nội dung tiếp tục bị bóp hẹp bởi các lớp container `max-w-7xl mx-auto` hoặc `max-w-[1400px] mx-auto`.

Thiết kế này lãng phí nghiêm trọng diện tích hiển thị trên các màn hình máy tính để bàn (Desktop / Ultra-wide monitors), hạn chế không gian trình bày của các bảng dữ liệu đa cột (Đơn hàng, Khách hàng CRM, Bảng kịch bản tự động) và các biểu đồ phân tích SVG. Việc chuyển đổi toàn bộ giao diện sang kiến trúc **Full-Width Canvas (tràn 100% chiều rộng và chiều cao màn hình)** sẽ tối ưu hóa tối đa không gian làm việc, tạo trải nghiệm ứng dụng SaaS chuyên nghiệp, hiện đại và rộng rãi.

## What Changes

- **Loại bỏ khung cửa sổ giới hạn ở layout gốc (`MacWindowShell`):**
  - Chuyển container ngoài cùng từ khung bo góc căn giữa (`max-w-[1560px]`, `p-2 sm:p-4 md:p-6`) sang layout toàn màn hình (`w-full h-screen overflow-hidden flex flex-col bg-white`).
  - Loại bỏ các lớp viền bo tròn (`rounded-[24px]`), viền ngoài (`border border-slate-200/90`), bóng đổ (`shadow-mac-window`) và nền blueprint thừa xung quanh.
  - Tái cấu trúc thanh tiêu đề macOS (Traffic Lights + System Status pill) trở thành thanh System Bar trên cùng trải dài 100% chiều ngang mép trên của màn hình.
- **Loại bỏ các container giới hạn chiều rộng trong các trang dashboard con:**
  - `frontend/src/app/(dashboard)/analytics/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, mở rộng biểu đồ và bảng Bento tràn 100% canvas.
  - `frontend/src/app/(dashboard)/automation/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, danh sách kịch bản hiển thị toàn chiều rộng.
  - `frontend/src/app/(dashboard)/customers/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, mở rộng bảng dữ liệu CRM và bộ 4 thẻ KPI.
  - `frontend/src/app/(dashboard)/pages/page.tsx`: Gỡ bỏ `max-w-[1400px] mx-auto`, lưới Fanpage cards trải đều toàn màn hình.
  - `frontend/src/app/(dashboard)/posts/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, mở rộng danh sách bài viết và lịch Calendar View.
  - `frontend/src/app/(dashboard)/posts/new/page.tsx`: Gỡ bỏ `max-w-7xl mx-auto`, tối ưu không gian soạn thảo Split-Pane và Live Preview.
  - `frontend/src/app/(dashboard)/page.tsx` & `orders/page.tsx`: Đảm bảo `w-full` đồng nhất, không có container co cụm ở giữa trang.
- **Giữ vững phong cách thiết kế macOS Clean Utility:** Bảo toàn toàn bộ màu sắc, typography, avatar, badges, các nút bấm traffic lights và trải nghiệm tương tác mượt mà.

## Capabilities

### New Capabilities
- `dashboard-layout`: Quy định kiến trúc và tiêu chuẩn hiển thị Full-Width 100% Viewport Canvas cho toàn bộ hệ thống Dashboard của ShopFlow, loại bỏ các container giới hạn chiều rộng ở giữa trang và cung cấp không gian làm việc tối đa cho các công cụ kinh doanh.

### Modified Capabilities
<!-- Không có capability nào bị thay đổi về mặt nghiệp vụ backend hay data model -->

## Impact

- **Mã nguồn bị ảnh hưởng:**
  - `frontend/src/components/layout/mac-window-shell.tsx`: Cấu trúc lại thành Full-width viewport container.
  - `frontend/src/app/(dashboard)/layout.tsx`: Đồng bộ chiều cao `h-screen` và loại bỏ padding nền.
  - 7 trang dashboard tại `frontend/src/app/(dashboard)/**/page.tsx`: Bỏ các container `max-w-` và `mx-auto`.
- **Hệ thống Backend / Database:** Hoàn toàn không bị ảnh hưởng.
- **Kiểm thử giao diện:** Cập nhật các test selector nếu có kiểm tra class container.
