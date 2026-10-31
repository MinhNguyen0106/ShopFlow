# Spec Delta: dashboard-layout

## Purpose

Cung cấp kiến trúc bố cục tràn viền toàn màn hình (Full-Width Canvas) cho toàn bộ bảng điều khiển ShopFlow, loại bỏ các container giới hạn chiều rộng ở giữa trang nhằm tối đa hóa diện tích hiển thị cho các công cụ quản trị.

## ADDED Requirements

### Requirement: Full-Viewport Dashboard Window Shell
Hệ thống SHALL hiển thị khung giao diện bảng điều khiển bao phủ 100% chiều rộng và chiều cao viewport (Full-Width & Full-Height), loại bỏ hoàn toàn các khung viền bo tròn giới hạn chiều rộng cố định và lớp padding bao quanh ở giữa màn hình.

#### Scenario: Hiển thị toàn màn hình trên các thiết bị máy tính
- **WHEN** người dùng đăng nhập thành công và truy cập vào bất kỳ trang nào trong bảng điều khiển Dashboard
- **THEN** giao diện bao phủ toàn bộ chiều ngang (`w-full`) và chiều cao (`h-screen`) mà không có lề padding ngoài hoặc nền thừa bao quanh

#### Scenario: Không giới hạn kích thước chiều ngang
- **WHEN** người dùng mở ứng dụng trên các màn hình có độ phân giải lớn (2K, 4K hoặc màn hình Ultra-wide 21:9)
- **THEN** khung ứng dụng tự động mở rộng 100% chiều ngang mép màn hình thay vì bị giới hạn ở 1560px

### Requirement: Edge-to-Edge System Header Bar
Hệ thống SHALL hiển thị thanh điều khiển hệ thống phong cách macOS (gồm các nút traffic lights, tiêu đề cửa sổ, và huy hiệu trạng thái hệ thống) trải dài 100% mép trên cùng của màn hình mà không bị bo góc hay thụt lề.

#### Scenario: Thanh header trải dài toàn bộ mép trên
- **WHEN** người dùng quan sát phần đỉnh của giao diện làm việc
- **THEN** thanh header hệ thống có chiều cao cố định và trải dài từ mép trái sang mép phải với viền dưới ngăn cách nhẹ nhàng

### Requirement: Unconstrained Fluid Workspace Canvas
Hệ thống SHALL cung cấp không gian làm việc nội dung chính (main workspace canvas) mở rộng 100% chiều rộng màn hình và cuộn dọc độc lập, loại bỏ triệt để các lớp container giới hạn kích thước (`max-w-7xl`, `max-w-[1400px]`, `mx-auto`) trong toàn bộ các trang con.

#### Scenario: Truy cập các trang nghiệp vụ đa cột dữ liệu
- **WHEN** người dùng truy cập các trang `/analytics`, `/automation`, `/customers`, `/pages`, `/posts`, `/posts/new`, hoặc `/orders`
- **THEN** nội dung của trang chiếm trọn 100% chiều rộng của khu vực canvas làm việc, cho phép các bảng dữ liệu và biểu đồ hiển thị thoáng đãng và trực quan

#### Scenario: Trải nghiệm Live Chat tập trung
- **WHEN** người dùng truy cập trang Hộp thư Live Chat (`/inbox`)
- **THEN** bố cục 4-Pane Bento mở rộng tràn toàn bộ chiều rộng và chiều cao còn lại của màn hình làm việc mà không xuất hiện thanh cuộn kép ngoài ý muốn

### Requirement: Responsive Fluid Grid Retention
Hệ thống SHALL bảo toàn khả năng co giãn tự động của các lưới Bento Grid, thẻ metrics, bảng dữ liệu và bảng điều khiển trên mọi kích cỡ màn hình từ 1280px đến màn hình 4K.

#### Scenario: Thay đổi kích thước cửa sổ trình duyệt
- **WHEN** người dùng phóng to, thu nhỏ hoặc chia đôi cửa sổ trình duyệt
- **THEN** các phần tử giao diện tự động dàn trải tương thích theo lưới linh hoạt (fluid grid) mà không bị vỡ bố cục hay tràn lề ngang (horizontal overflow)
