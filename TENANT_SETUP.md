# ✨ Quản Lý Khách Hàng (Tenant Management) - Hướng Dẫn Cập Nhật

## 📝 Tổng Quan
Phiên bản hiện tại đã thêm tính năng **Quản Lý Khách Hàng** (Tenant Management) hoàn chỉnh:
- ✅ Giao diện thêm/xem khách hàng trong cả `index.html` (production) và `demo.html` (testing)
- ✅ JavaScript functions trong `api.js` để tương tác với API
- ✅ Backend functions trong `Code.gs` để xử lý dữ liệu khách hàng

---

## 🚀 Cách Deploy Cập Nhật Này

### Bước 1: Cập Nhật Code.gs trong Google Apps Script

**QUAN TRỌNG**: Google Apps Script deployment cũ không còn hỗ trợ các function mới. Bạn cần cập nhật code:

1. Mở Google Sheet "HOUSE-MANAGEMENT"
2. Chọn **Extensions → Apps Script**
3. **Xóa tất cả code cũ**
4. **Copy-paste toàn bộ nội dung file `Code.gs`** từ project vào editor
   - Bao gồm các functions mới:
     - `getAllTenants()` - Lấy danh sách khách
     - `addTenant()` - Thêm khách hàng mới
     - Updated `apiRouter()` - Hỗ trợ 'getAllTenants' và 'addTenant'
5. Click **Save**
6. **Deploy lại Web App** (nếu URL thay đổi, cập nhật trong `api.js`):
   - Click **Deploy** → **+ New deployment**
   - Chọn **Web app**
   - Execute as: Tài khoản của bạn
   - Who has access: **Anyone**
   - Click **Deploy**
   - **Copy URL mới** (hoặc giữ nguyên nếu URL cũ còn hoạt động)

### Bước 2: Cập Nhật `api.js` (nếu URL thay đổi)

Nếu deployment URL của GAS thay đổi:
1. Mở file `api.js`
2. Tìm dòng `const API_URL = '...'`
3. Thay bằng URL deployment mới từ bước 1
4. Save file

### Bước 3: Kiểm Tra Database

Google Apps Script cần spreadsheet hỗ trợ Tenants sheet:

1. Mở Google Sheet "HOUSE-MANAGEMENT"
2. Kiểm tra xem có sheet "Tenants" chưa
3. **Nếu chưa có**: Cần chạy `initDatabase()`:
   - Vào Google Apps Script editor
   - Click dropdown **Select function** (giữa Save và Execute)
   - Chọn **initDatabase**
   - Click **Run** (nút ▶️)
   - Allow quyền khi được hỏi
   - Kiểm tra Google Sheet - sẽ có 6 sheet mới

---

## 🧪 Kiểm Tra Tính Năng

### Test với Demo Mode
1. Mở **`demo.html`** trong browser
2. Click vào tab **"Khách Hàng"** (hoặc **"Quản Lý Khách Hàng"**)
3. Xem bảng với 6 khách hàng mẫu
4. Tính năng demo hoạt động mà không cần API

### Test với Production
1. Mở **`index.html`** trong browser
2. Click vào tab **"Khách Hàng"**
3. Click **"+ Thêm Khách"**
4. Modal sẽ hiện lên với các field:
   - Tên Khách Hàng
   - Số Điện Thoại
   - CCCD/CMND
   - Email
   - Phòng (dropdown)
5. **Lưu ý**: Nếu modal không populate dropdown phòng, có thể API chưa được cập nhật. Kiểm tra console (F12) để xem error.

---

## 🔄 Cấu Trúc Dữ Liệu Khách Hàng

### Cột trong Google Sheet "Tenants"
| Tên | Kiểu Dữ Liệu | Ví Dụ |
|-----|--------------|-------|
| TenantID | Text | TENANT-001-123 |
| FullName | Text | Nguyễn Văn A |
| Phone | Text | 0901234567 |
| IDCard | Text | 123456789 |
| Email | Text | nguyenvana@email.com |
| RoomID | Text | ROOM-001-101 |
| JoinDate | Text | 01/03/2026 |

---

## 📋 API Endpoints

### 1. Lấy Danh Sách Khách Hàng
```json
REQUEST:
{
  "action": "getAllTenants",
  "params": {}
}

RESPONSE (success):
{
  "success": true,
  "tenants": [
    {
      "tenantId": "TENANT-001-123",
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "idCard": "123456789",
      "email": "nguyenvana@email.com",
      "roomId": "ROOM-001-101",
      "joinDate": "01/03/2026"
    }
  ]
}
```

### 2. Thêm Khách Hàng Mới
```json
REQUEST:
{
  "action": "addTenant",
  "params": {
    "fullName": "Trần Thị B",
    "phone": "0912345678",
    "idCard": "234567890",
    "email": "tranthib@email.com",
    "roomId": "ROOM-001-102"
  }
}

RESPONSE (success):
{
  "success": true,
  "message": "Khách hàng được thêm thành công",
  "tenantId": "TENANT-002-456"
}
```

---

## ⚠️ Troubleshooting

### Vấn đề: "Không tìm thấy hàm tập lệnh: doPost"
**Nguyên nhân**: Code.gs không được cập nhật trong Google Apps Script  
**Giải pháp**:
1. Cập nhật Code.gs trong Google Apps Script (copy-paste toàn bộ file mới)
2. Click Save
3. Redeploy Web App
4. Cập nhật API_URL trong `api.js` nếu cần

### Vấn đề: Modal không load danh sách phòng
**Nguyên nhân**: API `getAllRooms` không trả về dữ liệu  
**Giải pháp**:
1. Kiểm tra xem Rooms sheet có dữ liệu không
2. Xem browser console (F12) để xem chi tiết error
3. Đảm bảo `getAllRooms` function hoạt động bình thường

### Vấn đề: Không thể thêm khách hàng
**Nguyên nhân**: Có thể do validation hoặc API error  
**Giải pháp**:
1. Kiểm tra browser console (F12)
2. Đảm bảo tất cả field bắt buộc được điền (Tên, Số điện thoại, Phòng)
3. Kiểm tra xem Google Apps Script deployment hoạt động

---

## 📝 Các File Thay Đổi

### Mới/Cập Nhật:
- ✅ `Code.gs` - Thêm 2 functions (`getAllTenants`, `addTenant`) + cập nhật `apiRouter`
- ✅ `api.js` - Thêm 4 functions (`loadTenants`, `loadTenantRooms`, `openAddTenantModal`, `addNewTenant`)
- ✅ `index.html` - Thêm tenant tab + modal HTML
- ✅ `demo.html` - Thêm tenant tab với 6 khách hàng mẫu

### Không thay đổi:
- `config.js` - Vẫn dùng được
- `vercel.json` - Vẫn hợp lệ
- `package.json` - Vẫn hợp lệ

---

## ✅ Checklist Hoàn Tất

- [ ] Cập nhật Code.gs trong Google Apps Script
- [ ] Chạy `initDatabase()` (nếu lần đầu)
- [ ] Deploy lại Web App
- [ ] Cập nhật API_URL trong `api.js` (nếu cần)
- [ ] Test demo mode (demo.html)
- [ ] Test production mode (index.html)
- [ ] Thêm khách hàng mẫu để test
- [ ] Deploy lên Vercel

---

## 🎉 Hoàn Thành!

Sau khi hoàn tất các bước trên, tính năng Quản Lý Khách Hàng sẽ hoạt động đầy đủ. Bạn có thể:
- Xem danh sách khách hàng
- Thêm khách hàng mới
- Tự động cập nhật status phòng thành "Đã Cho Thuê"
- Xem toàn bộ thông tin khách (tên, SĐT, CCCD, email, phòng, ngày vào)
