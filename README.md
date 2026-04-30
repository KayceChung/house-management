# 🏠 Hệ Thống Quản Lý Nhà Trọ Toàn Diện

**Xây dựng Hệ thống Quản lý Nhà Trọ Toàn diện bằng Google Apps Script - Vercel**

> Một ứng dụng web hiện đại, đẹp và miễn phí cho quản lý nhà trọ, phòng trọ, kí túc xá hoặc bất kỳ loại bất động sản cho thuê nào.

---

## ✨ Đặc Điểm Chính

### 🎨 Giao Diện Đẹp
- ✅ Responsive design (desktop + mobile)
- ✅ Gradient backgrounds, animations, modern UI
- ✅ Bootstrap 5 + Font Awesome icons
- ✅ Dark sidebar, light content area

### 📊 Tính Năng Quản Lý
- ✅ Dashboard thống kê (phòng trống, khách, doanh thu)
- ✅ Quản lý phòng (thêm, sửa, xóa)
- ✅ Báo cáo điện nước (chỉ số auto-calculate)
- ✅ Quản lý hóa đơn & thanh toán
- ✅ Quản lý khách hàng & hợp đồng

### 🚀 Triển Khai Miễn Phí
- **Frontend**: Vercel (miễn phí, auto-deploy, HTTPS)
- **Backend**: Google Apps Script (miễn phí, limitless)
- **Database**: Google Sheets (miễn phí, built-in backup)

### 🔒 An Toàn & Tin Cậy
- ✅ Data stored in Google Sheets (auto-backup)
- ✅ HTTPS encryption (Vercel)
- ✅ Google Account security
- ✅ No external API dependencies

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────┐
│         VERCEL FRONTEND             │
│  (React + Bootstrap + Fetch API)    │
└──────────────────┬──────────────────┘
                   │ HTTPS
                   ↓
┌─────────────────────────────────────┐
│    GOOGLE APPS SCRIPT BACKEND       │
│   (Route API calls + Calculate)     │
└──────────────────┬──────────────────┘
                   │ Native GAS API
                   ↓
┌─────────────────────────────────────┐
│       GOOGLE SHEETS DATABASE        │
│ (Rooms, Tenants, Bills, Assets...) │
└─────────────────────────────────────┘
```

---

## 📋 Yêu Cầu

- Google Account (Sheet + Apps Script)
- Vercel Account (free)
- GitHub Account (for deployment)
- Git command line

---

## 🚀 Bắt Đầu Nhanh

### Bước 1: Backend Setup (Google Apps Script)
```bash
# 1. Create/open "HOUSE-MANAGEMENT" Google Sheet
# 2. Extensions → Apps Script
# 3. Paste Code.gs content
# 4. Save, then Run → initDatabase
# 5. Deploy → Web app → Anyone → Get URL
```

### Bước 2: Frontend Config
```bash
# Edit config.js
# API_URL = 'https://script.google.com/macros/s/{ID}/usercodeapp'
```

### Bước 3: Vercel Deploy
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
# -> Vercel.com/new → Import → Deploy → Done!
```

👉 **Chi tiết xem:** [QUICKSTART.md](./QUICKSTART.md) | [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📂 Cấu Trúc Thư Mục

```
house-management/
├── index.html           # Frontend UI
├── api.js              # Frontend logic + API calls
├── config.js           # ⭐ API configuration (EDIT THIS)
├── Code.gs             # Backend (Google Apps Script)
├── package.json        # Node.js config
├── vercel.json         # Vercel config
├── .gitignore          # Git ignore rules
├── QUICKSTART.md       # Quick start guide
├── DEPLOYMENT.md       # Detailed deployment guide
└── README.md           # This file
```

---

## 🗄️ Database Schema

Google Sheet "HOUSE-MANAGEMENT" contains 6 sheets:

### 1. Rooms (Phòng)
Danh sách tất cả phòng cho thuê

### 2. Tenants (Khách Hàng)
Thông tin người thuê phòng

### 3. Contracts (Hợp Đồng)
Hợp đồng thuê

### 4. UtilityUsage (Chỉ Số)
Ghi chỉ số điện, nước

### 5. Transactions (Hóa Đơn)
Hóa đơn thanh toán

### 6. Assets (Tài Sản)
Tài sản, nội thất trong phòng

---

## 🔧 API Endpoints

All endpoints are `POST` to Google Apps Script Web App URL

### Request Format
```json
{
  "action": "functionName",
  "params": { "key": "value" }
}
```

### Available Actions
| Action | Params | Response |
|--------|--------|----------|
| `getDashboardStats` | - | Dashboard statistics |
| `getAllRooms` | - | List of all rooms |
| `addRoom` | `{ roomName, floor, price, description }` | New room ID |
| `submitUtilityReading` | `{ roomId, currentElec, currentWater }` | Success |
| `getUnpaidBills` | - | List of unpaid bills |
| `markBillAsPaid` | `{ transId }` | Success |

---

## 💡 Công Thức Tính Hóa Đơn

```
Total = RoomPrice + (CurrentElec - PreviousElec) * ElectricPrice
                  + (CurrentWater - PreviousWater) * WaterPrice
```

---

## 🎓 Sử Dụng

### Thêm Phòng
1. Vào tab "Quản Lý Phòng"
2. Click "Thêm Phòng"
3. Điền thông tin (Tên, Tầng, Giá)
4. Click "Thêm Phòng"

### Báo Cáo Điện Nước
1. Vào tab "Điện Nước"
2. Chọn phòng
3. Nhập chỉ số điện/nước hiện tại
4. Click "Lưu Báo Cáo"

### Quản Lý Hóa Đơn
1. Vào tab "Hóa Đơn"
2. Xem danh sách hóa đơn chưa thu
3. Click "Thu" để đánh dấu đã thanh toán

---

## 🆘 Troubleshooting

### ❌ "API không được cấu hình"
**Giải pháp**: Mở `config.js` và cập nhật `API_URL`

### ❌ "CORS Error"
**Giải pháp**: Vào Google Apps Script → Deploy → Manage → "Anyone" access

### ❌ "Sheet not found"
**Giải pháp**: Chạy `initDatabase()` trong Google Apps Script

### ❌ Dữ liệu không lưu
**Giải pháp**: Mở Console (F12) → Check API response

---

## 🔐 Security

- ✅ Google Account authentication
- ✅ HTTPS encryption (Vercel + GAS)
- ✅ Data in Google Sheets
- ✅ Server-side calculations

---

## 📄 License

MIT - Free to use and modify

---

## 👨‍💻 Built With

- **Frontend**: HTML5, CSS3, JavaScript ES6+, Bootstrap 5
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Hosting**: Vercel (frontend), Google Apps Script (backend)
- **Icons**: Font Awesome 6.4.0

---

**Made with ❤️ for Vietnamese house rental managers**

*"Miễn phí, mạnh mẽ, dễ sử dụng"*

Vercel + Google Apps Script = Modern app for free ✨
