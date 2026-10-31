# Design: Kiến Trúc Bố Cục Full-Width Canvas 100% Viewport

## Context

Tham chiếu [proposal.md](file:///c:/Users/Dell/Desktop/ShopFlow/openspec/changes/full-width-layout/proposal.md). Hiện tại, hệ thống layout của ShopFlow đang gặp tình trạng "lồng ghép container" (nested containers):
1. **Tầng Layout Cha (`MacWindowShell.tsx`):**
   - Đang đặt trong một khung bao ngoài với nền blueprint `min-h-screen bg-blueprint-grid p-2 sm:p-4 md:p-6 flex flex-col justify-center items-center`.
   - Cửa sổ ứng dụng bị giới hạn cứng bởi `max-w-[1560px] min-h-[92vh]` kèm bo góc lớn `rounded-[24px]` và bóng đổ `shadow-mac-window`.
2. **Tầng Trang Con (`(dashboard)/**/page.tsx`):**
   - Phần lớn các trang con (`/analytics`, `/automation`, `/customers`, `/pages`, `/posts`, `/posts/new`) lại tiếp tục bọc nội dung trong các thẻ `div` mang class `max-w-7xl mx-auto` hoặc `max-w-[1400px] mx-auto`.

Điều này khiến không gian hiển thị bị thu hẹp hai lần liên tiếp, đặc biệt trên các màn hình máy tính để bàn (1920x1080 hoặc 2560x1440), tạo ra các dải khoảng trắng thừa ở hai bên lề và làm chật chội các bảng dữ liệu nghiệp vụ (CRM, Đơn hàng, Live Chat).

## Goals / Non-Goals

**Goals:**
- Tối ưu hóa toàn bộ layout của `MacWindowShell` thành Viewport Canvas tràn 100% chiều rộng và 100% chiều cao (`w-full h-screen overflow-hidden`).
- Loại bỏ hoàn toàn các lớp container giới hạn chiều rộng (`max-w-7xl`, `max-w-[1400px]`, `mx-auto`) ở cả tầng khung ngoài và tầng trang con.
- Đảm bảo thanh tiêu đề macOS (Traffic lights & System status) trải dài mượt mà từ mép trái sang mép phải màn hình (Edge-to-Edge).
- Duy trì tính độc lập của thanh cuộn: Main content canvas cuộn dọc mượt mà (`overflow-y-auto`), Sidebar và Topbar cố định vị trí (Sticky/Fixed).
- Giữ nguyên 100% ngôn ngữ thiết kế macOS Clean Utility Bento Grid (màu sắc, typography, badges, gradients).

**Non-Goals:**
- Không mở rộng tràn viền cho các trang xác thực (`/login`, `/register`) vì modal thẻ 560px căn giữa là quy chuẩn chuẩn mực của Authentication Form.
- Không thay đổi bất kỳ logic xử lý nghiệp vụ, API DTO, Zustand stores hay cơ sở dữ liệu backend nào.

## Decisions

### Decision 1: Cấu Trúc Khung Layout Toàn Màn Hình (Edge-to-Edge Viewport Shell)
- **Giải pháp lựa chọn:**
  - Thay đổi container gốc trong [mac-window-shell.tsx](file:///c:/Users/Dell/Desktop/ShopFlow/frontend/src/components/layout/mac-window-shell.tsx) từ khung cửa sổ lơ lửng sang cấu trúc `h-screen w-full flex flex-col overflow-hidden bg-white`.
  - Loại bỏ các class padding ngoài `p-2 sm:p-4 md:p-6`, `bg-blueprint-grid`, `rounded-[24px]`, `border`, `shadow-mac-window`, và `max-w-[1560px]`.
  - Thanh tiêu đề macOS Header (`h-10 border-b w-full shrink-0`) trải dài 100% mép trên cùng của màn hình.
  - Phân vùng làm việc chính:
    - Sidebar cố định bên trái: `w-64 shrink-0 h-full border-r border-slate-200 bg-white flex flex-col`.
    - Khu vực bên phải: `flex-1 flex flex-col h-full overflow-hidden`.
    - Topbar bên trên: `h-14 border-b border-slate-200 bg-white/95 shrink-0 px-6 flex items-center justify-between`.
    - Main Workspace Canvas bên dưới: `flex-1 overflow-y-auto p-6 bg-slate-50/50 w-full`.
- **Phương án thay thế đã cân nhắc:**
  - Giữ lại nút maximize để chuyển đổi giữa fixed full-screen và boxed window: Bị loại bỏ vì người dùng muốn toàn bộ trải nghiệm mặc định là full-width 100%, không cần phải bấm maximize mỗi lần tải lại trang. Nút xanh trên traffic lights có thể gọi Fullscreen API của trình duyệt (`document.documentElement.requestFullscreen()`).

### Decision 2: Chuẩn Hóa Fluid Canvas Trên Toàn Bộ Các Trang Nghiệp Vụ
- **Giải pháp lựa chọn:**
  - Gỡ bỏ hoàn toàn `max-w-7xl mx-auto` và `max-w-[1400px] mx-auto` tại tất cả 7 trang dashboard.
  - Thay thế bằng thẻ bọc chuẩn hóa:
    ```tsx
    <div className="w-full space-y-6">...</div>
    ```
  - Các phần tử dạng lưới (Bento Grid) như `CustomerMetrics`, `AnalyticsMetrics`, `BentoMetrics` tự động dàn trải trên toàn bộ chiều rộng có sẵn (dùng `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`).
  - Các bảng dữ liệu (`CustomerTable`, `OrderTable`, `TopProductsTable`) tự động mở rộng 100% không gian, các cột thông tin hiển thị đầy đủ mà không bị co cụm.
- **Phương án thay thế đã cân nhắc:**
  - Dùng `max-w-none` để override: Thay vì ghi đè, việc xóa sạch các class `max-w-*` và `mx-auto` trực tiếp giúp mã nguồn sạch hơn, dễ bảo trì và không gây xung đột CSS specificity.

### Decision 3: Kiểm Soát Trải Nghiệm Trên Màn Hình Siêu Rộng (Ultra-wide Layout Harmony)
- **Giải pháp lựa chọn:**
  - Áp dụng đệm chuẩn `p-6` ở tầng main canvas, kết hợp khoảng cách `gap-6` giữa các cột Bento.
  - Đối với các trang chia cột (như màn hình Soạn bài viết Split-Pane `/posts/new`), cấu trúc cột trái (soạn thảo) và cột phải (Live preview) chia tỷ lệ linh hoạt (ví dụ: `lg:grid-cols-12` với tỷ lệ 7/5) để cả hai bên đều rộng rãi và trực quan.

## Risks / Trade-offs

- **[Risk] Các phần tử text đơn lẻ hoặc banner có thể bị quá dài trên màn hình 4K:**
  - *Mitigation:* Giữ các đoạn văn bản mô tả phụ (subtitles/descriptions) với giới hạn ký tự tự nhiên `max-w-2xl` hoặc `max-w-3xl` tại chính phần tử đó, trong khi toàn bộ khối khung bao ngoài vẫn full-width 100%.
- **[Risk] Các bài test kiểm tra class DOM bị ảnh hưởng:**
  - *Mitigation:* Rà soát các bộ test frontend (`*.test.tsx`) để cập nhật nếu có test case kiểm tra selector class `max-w-7xl` hoặc `mac-window-shell`.
