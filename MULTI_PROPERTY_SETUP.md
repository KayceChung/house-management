# 🏢 Hướng Dẫn Multi-Property Setup

## 📋 Tổng Quan

Hệ thống đã được cập nhật để hỗ trợ **quản lý nhiều bất động sản** với cấu trúc:
- **1 Người Quản Lý** → Quản lý nhiều **Bất Động Sản** → Mỗi bất động sản có **Phòng, Khách, Hóa Đơn, ...**

---

## 🔄 Cấu Trúc Database Mới

### Trước (Single-Property)
```
Sheet "Rooms"          [RoomID, RoomName, Floor, Status, Price, Description]
Sheet "Tenants"        [TenantID, FullName, Phone, ...]
Sheet "Transactions"   [TransID, RoomID, Month, Year, Amount, ...]
```

### Sau (Multi-Property)
```
Sheet "Managers"       [ManagerID, ManagerName, Email, Phone, CreatedDate]
Sheet "Properties"     [PropertyID, ManagerID, PropertyName, Address, TotalRooms, CreatedDate]
Sheet "Rooms"          [RoomID, PropertyID, RoomName, Floor, Status, Price, Description]
Sheet "Tenants"        [TenantID, PropertyID, FullName, Phone, ...]
Sheet "Transactions"   [TransID, PropertyID, RoomID, Month, Year, Amount, ...]
```

---

## 🚀 Bước 1: Tạo Database Mới (Nếu chưa có)

### Trong Google Apps Script, chạy function:
```javascript
initDatabase()
```

✅ Điều này sẽ tạo **8 sheets** với đầy đủ PropertyID columns:
- ✓ Managers
- ✓ Properties
- ✓ Rooms (updated)
- ✓ Tenants (updated)
- ✓ Contracts (updated)
- ✓ UtilityUsage (updated)
- ✓ Transactions (updated)
- ✓ Assets (updated)

---

## 🔧 Bước 2: Sử Dụng API Functions

### A. Quản Lý Người Quản Lý

**Thêm người quản lý:**
```json
{
  "action": "addManager",
  "params": {
    "managerName": "Nguyễn Văn A",
    "email": "manager@example.com",
    "phone": "0901234567"
  }
}
```

**Response:**
```json
{
  "success": true,
  "managerId": "MGR-123456-789",
  "message": "Người quản lý Nguyễn Văn A được thêm thành công"
}
```

**Lấy tất cả người quản lý:**
```json
{
  "action": "getAllManagers"
}
```

---

### B. Quản Lý Bất Động Sản

**Thêm bất động sản:**
```json
{
  "action": "addProperty",
  "params": {
    "managerId": "MGR-123456-789",
    "propertyName": "Nhà Trọ Đường A",
    "address": "123 Đường Nguyễn Huệ, Q1, TP.HCM",
    "totalRooms": 20
  }
}
```

**Response:**
```json
{
  "success": true,
  "propertyId": "PROP-654321-456",
  "message": "Bất động sản Nhà Trọ Đường A được thêm thành công"
}
```

**Lấy bất động sản của người quản lý:**
```json
{
  "action": "getPropertiesByManager",
  "params": {
    "managerId": "MGR-123456-789"
  }
}
```

**Lấy tất cả bất động sản:**
```json
{
  "action": "getAllProperties"
}
```

---

### C. Quản Lý Phòng (Cập Nhật)

**Thêm phòng (Bây giờ cần PropertyID):**
```json
{
  "action": "addRoom",
  "params": {
    "propertyId": "PROP-654321-456",
    "roomName": "Phòng 101",
    "floor": "1",
    "price": 5000000,
    "description": "Phòng nhỏ, có cửa sổ"
  }
}
```

**Lấy phòng của bất động sản:**
```json
{
  "action": "getRoomsByProperty",
  "params": {
    "propertyId": "PROP-654321-456"
  }
}
```

---

## 💡 Ví Dụ Workflow

### Scenario: Quản lý nhiều nhà trọ

**Step 1: Thêm Người Quản Lý**
```
addManager("Nguyễn Văn A", "manager@email.com", "0901234567")
→ ManagerID: MGR-111111-111
```

**Step 2: Thêm Bất Động Sản #1**
```
addProperty(MGR-111111-111, "Nhà Trọ Đường 1", "Địa chỉ 1", 10)
→ PropertyID: PROP-222222-222
```

**Step 3: Thêm Bất Động Sản #2**
```
addProperty(MGR-111111-111, "Nhà Trọ Đường 2", "Địa chỉ 2", 15)
→ PropertyID: PROP-333333-333
```

**Step 4: Thêm Phòng cho Bất Động Sản #1**
```
addRoom(PROP-222222-222, "Phòng 101", "1", 5000000, "Chi tiết")
→ RoomID: ROOM-444444-444
```

**Step 5: Thêm Phòng cho Bất Động Sản #2**
```
addRoom(PROP-333333-333, "Phòng 201", "2", 6000000, "Chi tiết")
→ RoomID: ROOM-555555-555
```

---

## 📝 Lưu Ý Quan Trọng

### ❌ Migration từ Single-Property
Nếu bạn đã có dữ liệu cũ:
1. **Backup** Google Sheet hiện tại
2. **Chạy `initDatabase()`** để tạo sheets mới
3. **Copy dữ liệu** từ sheets cũ sang sheets mới
4. Thêm `PropertyID` cho tất cả rows (có thể dùng copy-paste)

### ⚠️ Backward Compatibility
Hàm `getAllRooms()` vẫn hoạt động, nhưng sẽ trả về tất cả phòng từ tất cả bất động sản. 

**Khuyến nghị:** Dùng `getRoomsByProperty(propertyId)` để lọc theo bất động sản cụ thể.

---

## 🔗 API Endpoints

| Action | Param | Mục Đích |
|--------|-------|---------|
| `addManager` | managerName, email, phone | Thêm người quản lý |
| `getAllManagers` | - | Lấy tất cả người quản lý |
| `addProperty` | managerId, propertyName, address, totalRooms | Thêm bất động sản |
| `getPropertiesByManager` | managerId | Lấy bất động sản của người quản lý |
| `getAllProperties` | - | Lấy tất cả bất động sản |
| `addRoom` | propertyId, roomName, floor, price, description | Thêm phòng (mới) |
| `getRoomsByProperty` | propertyId | Lấy phòng của bất động sản |

---

## 🧪 Test trong Google Apps Script

Chạy lần lượt các command sau:

```javascript
// 1. Tạo database
initDatabase()

// 2. Thêm manager
addManager("Nguyễn Văn A", "a@email.com", "0901234567")
// Copy ManagerID từ response

// 3. Thêm property
addProperty("MGR-...", "Nhà Trọ Test", "Địa chỉ test", 10)
// Copy PropertyID từ response

// 4. Thêm room
addRoom("PROP-...", "Phòng 101", "1", 5000000, "Phòng test")

// 5. Lấy dữ liệu
getAllManagers()
getAllProperties()
getRoomsByProperty("PROP-...")
```

---

## ✅ Dự Án Đã Sẵn Sàng

Bạn có thể:
- ✓ Quản lý nhiều người quản lý
- ✓ Mỗi người quản lý quản lý nhiều bất động sản
- ✓ Mỗi bất động sản có nhiều phòng
- ✓ Tất cả dữ liệu tự động phân biệt theo PropertyID

🚀 **Tiếp theo:** Update Frontend UI để hiển thị selector cho Managers + Properties!
