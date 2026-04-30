# 🏠 Quản Lý Nhà Trọ - Quick Start

Hệ thống quản lý nhà trọ toàn diện với **Frontend đẹp trên Vercel** + **Backend mạnh mẽ trên Google Apps Script**

---

## ⚡ 5 Bước Nhanh

### 1️⃣ Google Apps Script - Backend
```
1. Vào Google Sheet "HOUSE-MANAGEMENT"
2. Extensions → Apps Script
3. Copy toàn bộ Code.gs vào editor → Save
4. Chọn initDatabase → Run (accept permissions)
5. Deploy → New deployment → Web app → Anyone → Deploy
6. Copy URL (sẽ dùng ở bước 3)
```

### 2️⃣ Cấu Hình Frontend
```
Mở config.js:
- Thay API_URL = 'https://script.google.com/macros/s/YOUR_ID/usercodeapp'
- (ID lấy từ bước 1)
```

### 3️⃣ Deploy Vercel
```
1. git init && git add . && git commit -m "init"
2. Push lên GitHub
3. Vercel.com/new → Import GitHub → Select repo → Deploy
4. Done! 🚀
```

---

## 📊 Các Tính Năng

| Tính Năng | Mô Tả |
|-----------|-------|
| 📊 Dashboard | Thống kê phòng, thu nhập, hóa đơn chưa thu |
| 🚪 Quản Lý Phòng | Thêm phòng, xem danh sách, quản lý giá |
| ⚡ Báo Cáo Điện Nước | Ghi chỉ số, tính chi phí tự động |
| 💰 Hóa Đơn | Xem hóa đơn chưa thu, đánh dấu đã thanh toán |

---

## 🗂️ Cấu Trúc Database

```
Google Sheet "HOUSE-MANAGEMENT"
├── Rooms (Danh sách phòng)
├── Tenants (Người thuê)
├── Contracts (Hợp đồng)
├── UtilityUsage (Số điện/nước)
├── Transactions (Hóa đơn)
└── Assets (Tài sản)
```

---

## 🔗 File Quan Trọng

- **index.html** - Giao diện
- **api.js** - Logic frontend
- **config.js** - ⭐ Cấu hình API (PHẢI THAY)
- **Code.gs** - Backend Google Apps Script
- **vercel.json** - Cấu hình Vercel
- **DEPLOYMENT.md** - Hướng dẫn chi tiết

---

## 🚨 Lỗi Thường Gặp

| Lỗi | Giải Pháp |
|-----|---------|
| API không được cấu hình | Cập nhật config.js |
| CORS Error | Deploy GAS với "Anyone" |
| Sheet not found | Chạy initDatabase() |

---

## 📞 Support

Xem **DEPLOYMENT.md** để hướng dẫn chi tiết từng bước.

---

**Made with ❤️ for Vietnamese house rental managers**

Vercel + Google Apps Script = Free + Powerful ✨
