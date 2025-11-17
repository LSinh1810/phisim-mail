# PhishSim - Hệ thống Mô phỏng Phishing Simulation

Hệ thống phishing simulation được xây dựng với Node.js (Express), React, MongoDB và các biện pháp bảo mật nâng cao.

## 📋 Tính năng

### 1. Landing Page Giáo dục
- Sau khi người dùng click link phishing, hiển thị trang cảnh báo giáo dục
- Hướng dẫn nhận biết email phishing
- Hướng dẫn cách báo cáo email đáng ngờ
- Nút tải tài liệu hướng dẫn

### 2. Authentication & Security
- **JWT Authentication**: Token hết hạn sau 30 phút
- **Password**: Mật khẩu admin lưu trong biến môi trường `ADMIN_PASSWORD`
- **Helmet**: Headers bảo mật chống XSS, clickjacking, MIME-type sniffing
- **Rate Limiting**: Chống spam và brute force attack
- **XSS Clean**: Chống XSS attacks

### 3. Logging Chi tiết
- Track đầy đủ thông tin click:
  - Timestamp, campaignId, email, token
  - IP address, X-Forwarded-For
  - User-Agent (browser/device)
  - Referrer
  - Accept-Language
- Dữ liệu lưu trong collection `clicks` riêng biệt

### 4. Dashboard Analytics
- **Bar Chart**: Lượt click theo thời gian (7 ngày gần nhất)
- **Top 5 Browsers**: Bảng thống kê trình duyệt phổ biến
- **Stats Cards**: Tổng chiến dịch, người nhận, lượt nhấp

### 5. Chi tiết Campaign
- Hiển thị thông tin click chi tiết theo từng email
- Expand/Collapse để xem:
  - IP address
  - User-Agent
  - Referrer
  - Accept-Language
  - Timestamp

## 🛠️ Công nghệ sử dụng

### Backend
- **Express.js**: Web framework
- **MongoDB + Mongoose**: Database
- **Nodemailer**: Gửi email
- **JWT**: Authentication
- **Helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **Helmet CSP**: XSS prevention (thay cho xss-clean deprecated)

### Frontend
- **React**: UI framework
- **React Router**: Routing
- **Tailwind CSS**: Styling
- **Recharts**: Charts
- **Axios**: API calls
- **Zustand**: State management
- **Sonner**: Toast notifications

- **Lucide React**: Icons

## Cách khởi chạy hệ thống
- Clone từ github về hoặc tải
- `cd` vào thư mục backend và frontend rồi chạy lệnh `npm run dev`.

