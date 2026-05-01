# 📚 Hướng Dẫn Sử Dụng API CORS & JSON

## ✅ Các sửa đổi đã thực hiện

### 1. **Hàm `doGet(e)` - Hỗ trợ API JSON**
- ✅ Thêm kiểm tra `e.parameter.type === 'api'`
- ✅ Trả về JSON thay vì HTML khi gọi với `?type=api`
- ✅ Thêm CORS headers
- ✅ Mặc định vẫn trả về giao diện HTML

### 2. **Hàm `doPost(e)` - Hỗ trợ JSON từ postData**
- ✅ Phân tích JSON từ `e.postData.contents` (phương pháp GET/POST chuẩn)
- ✅ Fallback sang form-urlencoded nếu cần
- ✅ Thêm CORS headers đầy đủ
- ✅ Xử lý lỗi chi tiết

---

## 🔗 Cách Gọi API từ Frontend

### **1. GET - Lấy Dashboard Stats (JSON)**
```javascript
const DEPLOYED_URL = "YOUR_DEPLOY_URL_HERE"; // Ví dụ: https://script.google.com/macros/d/xxxxx/usercontent

// Gọi lấy dữ liệu JSON
fetch(DEPLOYED_URL + "?type=api", {
  method: "GET",
  redirect: "follow" // BẮT BUỘC để tránh lỗi CORS
})
.then(response => response.json())
.then(data => {
  console.log("✅ Nhận được dữ liệu:", data);
  console.log("Số phòng:", data.totalRooms);
  console.log("Số tenant:", data.totalTenants);
  console.log("Doanh thu tháng:", data.monthlyRevenue);
})
.catch(err => console.error("❌ Lỗi kết nối API:", err));
```

---

### **2. POST - Thêm/Cập nhật dữ liệu (JSON)**

#### **A. Thêm Quản Lý Mới**
```javascript
const payload = {
  action: "addManager",
  managerName: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  phone: "0987654321"
};

fetch(DEPLOYED_URL, {
  method: "POST",
  redirect: "follow",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(response => response.json())
.then(data => {
  console.log("✅ Kết quả:", data);
  if (data.success) {
    console.log("Mã QL mới:", data.newId);
  }
})
.catch(err => console.error("❌ Lỗi:", err));
```

#### **B. Lấy Danh Sách Quản Lý**
```javascript
const payload = {
  action: "getAllManagers"
};

fetch(DEPLOYED_URL, {
  method: "POST",
  redirect: "follow",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(response => response.json())
.then(data => {
  console.log("✅ Danh sách QL:", data);
  data.managers.forEach(m => {
    console.log(`${m.managerId}: ${m.name} - ${m.email}`);
  });
})
.catch(err => console.error("❌ Lỗi:", err));
```

#### **C. Thêm Bất Động Sản (Property)**
```javascript
const payload = {
  action: "addProperty",
  managerId: 1,
  propertyName: "Nhà Trọ Huỳnh Thúc Kháng",
  address: "123 Huỳnh Thúc Kháng, Q. Đống Đa, Hà Nội",
  totalRooms: 10
};

fetch(DEPLOYED_URL, {
  method: "POST",
  redirect: "follow",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(response => response.json())
.then(data => console.log("✅ Kết quả:", data))
.catch(err => console.error("❌ Lỗi:", err));
```

#### **D. Thêm Phòng (Room)**
```javascript
const payload = {
  action: "addRoom",
  propertyId: 1,
  roomName: "Phòng 101",
  floor: 1,
  price: 5000000,
  description: "Phòng góc, view đường"
};

fetch(DEPLOYED_URL, {
  method: "POST",
  redirect: "follow",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(response => response.json())
.then(data => console.log("✅ Kết quả:", data))
.catch(err => console.error("❌ Lỗi:", err));
```

---

## 🐛 Xử Lý Lỗi Thường Gặp

### **1. Lỗi 405 Method Not Allowed**
**Nguyên nhân:** Bạn chỉ có `doGet` hoặc không có `doPost`  
**Giải pháp:** ✅ Đã sửa xong - bây giờ có cả `doGet` và `doPost`

### **2. Lỗi CORS**
**Nguyên nhân:** Thiếu `redirect: "follow"` trong request  
**Giải pháp:** Luôn thêm `redirect: "follow"` trong mọi fetch request

```javascript
fetch(url, {
  method: "GET",
  redirect: "follow" // ← BẮT BUỘC
})
```

### **3. URL cũ không có hàm `doPost`**
**Nguyên nhân:** Bạn sửa code nhưng chưa tạo Version mới  
**Giải pháp:** 
1. Sửa code xong → Lưu
2. Click **Deploy** → **Manage Deployments**
3. Nhấn biểu tượng **✏️ (Edit)**
4. Chọn **Version: "New version"** từ dropdown
5. Nhấn **Deploy** → **Update**

### **4. Lỗi "GAS is not bound to a spreadsheet"**
**Nguyên nhân:** SPREADSHEET_ID không khớp với Spreadsheet thực tế  
**Giải pháp:**
- Mở Google Sheets của bạn (HOUSE-MANAGEMENT)
- Copy ID từ URL: `https://docs.google.com/spreadsheets/d/**1NMhhF31uc77uhv-C_vppT4w5e3Wbgw4KsIf36xbGXo8**/`
- Dán vào `SPREADSHEET_ID` trong Code.gs
- Lưu lại

---

## 📋 Danh Sách Action Hỗ Trợ

| Action | Phương thức | Dữ liệu cần gửi | Mô tả |
|--------|-----------|-----------------|-------|
| `getAllManagers` | POST | - | Lấy tất cả quản lý |
| `addManager` | POST | `managerName, email, phone` | Thêm QL mới |
| `getAllProperties` | POST | - | Lấy tất cả bất động sản |
| `addProperty` | POST | `managerId, propertyName, address, totalRooms` | Thêm BDS mới |
| `getRooms` | POST | `propertyId` | Lấy phòng theo BDS |
| `addRoom` | POST | `propertyId, roomName, floor, price, description` | Thêm phòng mới |
| `getTenants` | POST | - | Lấy tất cả tenant |
| `addTenant` | POST | `name, email, phone, roomId, contractStartDate, contractEndDate` | Thêm tenant mới |

---

## ✨ Ví Dụ HTML Đầy Đủ

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Test API</title>
  <style>
    body { font-family: Arial; margin: 20px; }
    button { padding: 10px 15px; margin: 5px; cursor: pointer; }
    .result { background: #f0f0f0; padding: 10px; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>🧪 Test API House Management</h1>
  <button onclick="testGetAPI()">📊 Lấy Dashboard Stats (GET)</button>
  <button onclick="testPostAPI()">➕ Thêm Manager (POST)</button>
  
  <div id="result" class="result"></div>

  <script>
    const DEPLOYED_URL = "YOUR_DEPLOY_URL_HERE";

    function testGetAPI() {
      fetch(DEPLOYED_URL + "?type=api", {
        method: "GET",
        redirect: "follow"
      })
      .then(r => r.json())
      .then(data => {
        document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      })
      .catch(e => {
        document.getElementById('result').innerHTML = '❌ Lỗi: ' + e.message;
      });
    }

    function testPostAPI() {
      const payload = {
        action: "addManager",
        managerName: "Test Manager",
        email: "test@example.com",
        phone: "0123456789"
      };

      fetch(DEPLOYED_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(r => r.json())
      .then(data => {
        document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      })
      .catch(e => {
        document.getElementById('result').innerHTML = '❌ Lỗi: ' + e.message;
      });
    }
  </script>
</body>
</html>
```

---

## 🚀 Các Bước Tiếp Theo

1. ✅ **Sửa Code.gs** - Đã hoàn thành (hàm `doGet` & `doPost`)
2. 📝 **Tạo Deployment mới**
   - Mở Google Apps Script Editor
   - Click **Deploy** → **New Deployment**
   - Type: **Web app**
   - Execute as: **Your account**
   - Who has access: **Anyone**
   - Click **Deploy**
3. 🔗 **Copy URL Deploy** - Dùng `https://...` từ "New deployments"
4. 🧪 **Test API** - Dùng ví dụ HTML trên hoặc fetch từ browser console
5. 📱 **Tích hợp vào Website** - Dùng các ví dụ fetch ở trên

---

## 📞 Ghi Chú

- ✅ CORS headers đã được thêm vào cả `doGet` và `doPost`
- ✅ Hỗ trợ JSON từ `postData.contents` (phương pháp chuẩn)
- ✅ Fallback sang form-urlencoded nếu cần
- ✅ Xử lý lỗi chi tiết với logging
- ⚠️ Nhớ tạo **New Deployment** sau khi sửa code!

**Chúc bạn sử dụng API thành công! 🎉**
