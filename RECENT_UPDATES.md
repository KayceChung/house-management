# 🆕 Cập Nhật Gần Đây - Quản Lý Khách Hàng

## 📅 Phiên Bản: 1.1 (Tenant Management Update)

### ✨ Tính Năng Mới Thêm

#### 1️⃣ **Quản Lý Khách Hàng (Tenant Management)**
Tab mới trong giao diện cho phép:
- 📋 **Xem danh sách khách hàng** - Hiển thị tất cả thông tin: ID, Tên, SĐT, CCCD, Email, Phòng, Ngày vào
- ➕ **Thêm khách hàng mới** - Modal form với validation
- 🔗 **Liên kết tự động** - Khi thêm khách, phòng tự động cập nhật status thành "Đã Cho Thuê"

---

## 🔄 Các File Đã Thay Đổi

### Backend (Google Apps Script)
**File: `Code.gs`**
```javascript
// 2 functions mới thêm:
1. getAllTenants() 
   - Truy vấn Tenants sheet
   - Trả về array of tenant objects
   
2. addTenant(fullName, phone, idCard, email, roomId)
   - Tạo TenantID tự động
   - Lưu vào Tenants sheet
   - Cập nhật Room status → "Đã Cho Thuê"
   - Trả về tenantId

// API Router update:
apiRouter() switch statement:
  - case 'getAllTenants': return getAllTenants()
  - case 'addTenant': return addTenant(params)
```

### Frontend - API Layer
**File: `api.js`**
```javascript
// 4 functions mới thêm:
1. loadTenants()
   - Gọi API 'getAllTenants'
   - Render table với 7 columns
   
2. loadTenantRooms()
   - Gọi API 'getAllRooms'
   - Populate dropdown "Phòng" trong modal
   
3. openAddTenantModal()
   - Load danh sách phòng
   - Show Bootstrap modal
   
4. addNewTenant()
   - Validate form (name, phone, roomId required)
   - Gọi API 'addTenant'
   - Refresh bảng khách hàng
```

### Frontend - UI
**File: `index.html`**
- ✅ Navigation link: "Khách Hàng" tab (với icon users)
- ✅ Tab content: Bảng khách hàng 7 columns
- ✅ Modal form: "Thêm Khách Hàng Mới" với fields:
  - Tên Khách Hàng (text, required)
  - Số Điện Thoại (text, required)
  - CCCD/CMND (text, optional)
  - Email (text, optional)
  - Phòng (dropdown, required)

**File: `demo.html`**
- ✅ Navigation link: "Khách Hàng" tab
- ✅ Tab content: Bảng với 6 khách hàng mẫu
  - Nguyễn Văn A - Phòng 101
  - Trần Thị B - Phòng 102
  - Hoàng Văn C - Phòng 201
  - Phạm Thị D - Phòng 202
  - Lê Văn E - Phòng 203
  - Dương Văn F - Phòng 301

### Documentation
**File mới: `TENANT_SETUP.md`**
- Hướng dẫn cập nhật Code.gs
- API endpoint documentation
- Troubleshooting guide
- Deployment checklist

**File update: `START_HERE.md`**
- Thêm Tenant Management vào danh sách tính năng
- Reference đến TENANT_SETUP.md

---

## 🎯 Tính Năng Chi Tiết

### Bảng Khách Hàng (Tenants Table)
| Cột | Nội Dung | Kiểu |
|-----|---------|------|
| ID | TENANT-001-123 | Auto-generated |
| Tên Khách | Nguyễn Văn A | Text |
| Số Điện Thoại | 0901234567 | Text |
| CCCD | 123456789 | Text |
| Email | nguyenvana@email.com | Text |
| Phòng | ROOM-001-101 | Auto-filled (linked to Rooms) |
| Ngày Vào | 01/03/2026 | Auto (current date) |

### Modal Thêm Khách Hàng
- **Header**: "Thêm Khách Hàng Mới" (với icon users)
- **Fields**:
  1. Tên Khách Hàng - Input text (VD: Nguyễn Văn A) - REQUIRED
  2. Số Điện Thoại - Input text (VD: 0123456789) - REQUIRED
  3. CCCD/CMND - Input text (VD: 123456789) - Optional
  4. Email - Input text (VD: email@example.com) - Optional
  5. Phòng - Select dropdown - REQUIRED
- **Buttons**: Hủy | Thêm Khách
- **Validation**: 
  - Tên khách: Bắt buộc
  - Số điện thoại: Bắt buộc
  - Phòng: Bắt buộc
  - Thông báo lỗi: "Vui lòng điền đầy đủ thông tin"

---

## 📊 Google Sheet Schema

### Tenants Sheet (mới)
```
Columns: TenantID | FullName | Phone | IDCard | Email | RoomID | JoinDate
```

Khi thêm khách hàng:
- TenantID được tạo auto (TENANT-XXX-YYY)
- JoinDate = Hôm nay (auto-filled)
- RoomID = Link tới Rooms table
- Room status được update thành "Đã Cho Thuê"

---

## 🧪 Testing

### Demo Mode (demo.html)
- ✅ Không cần API
- ✅ 6 khách hàng mẫu
- ✅ Test giao diện

### Production Mode (index.html)
- ⚠️ Cần update Code.gs trong Google Apps Script
- ⚠️ Cần deploy lại Web App
- ⚠️ Cần cấu hình đúng API URL

### Checklist Test
- [ ] Mở demo.html → Tab "Khách Hàng" hiển thị 6 khách?
- [ ] Click "Thêm Khách" → Modal hiện lên?
- [ ] Modal có 5 input fields?
- [ ] Dropdown "Phòng" có "-- Chọn Phòng --" placeholder?
- [ ] Mở index.html → Tab "Khách Hàng" hiển thị?
- [ ] Console (F12) không có error liên quan đến tenant?

---

## ⚠️ CẦN LÀM NGAY

### 1️⃣ Cập Nhật Code.gs (URGENT)
Deployment Google Apps Script cũ không hỗ trợ tenant functions. Cần:
1. Vào Google Apps Script editor
2. Copy-paste toàn bộ nội dung Code.gs mới
3. Click Save
4. Deploy → New deployment → Web app
5. Cập nhật API URL nếu thay đổi

### 2️⃣ Chạy initDatabase() (nếu lần đầu)
Kiểm tra xem Tenants sheet có tồn tại trong Google Sheet chưa:
1. Nếu không → Mở Google Apps Script → Chọn initDatabase → Run
2. Allow quyền khi được hỏi
3. Kiểm tra Google Sheet → Sẽ có 6 sheet

### 3️⃣ Test Production
1. Mở index.html
2. Vào "Khách Hàng" tab
3. Click "Thêm Khách"
4. Kiểm tra dropdown "Phòng" có load danh sách không?

---

## 📝 API Documentation

### Endpoint 1: getAllTenants
```json
REQUEST:
POST https://script.google.com/macros/s/{SCRIPT_ID}/exec
{
  "action": "getAllTenants",
  "params": {}
}

RESPONSE:
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

### Endpoint 2: addTenant
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

RESPONSE:
{
  "success": true,
  "message": "Khách hàng được thêm thành công",
  "tenantId": "TENANT-002-456"
}
```

---

## 🚀 Next Steps

1. ✅ **Immediate**: Cập nhật Code.gs + redeploy
2. ✅ **Testing**: Test demo.html + index.html
3. ✅ **Data**: Thêm khách hàng mẫu để test
4. ✅ **Deploy**: Vercel (frontend) + GAS (backend)
5. 📋 **Future**: 
   - Edit/Delete khách hàng
   - Search/Filter khách hàng
   - Contract management
   - Customer history

---

## 📖 Để Biết Thêm

👉 Xem file **TENANT_SETUP.md** để hướng dẫn cập nhật chi tiết

