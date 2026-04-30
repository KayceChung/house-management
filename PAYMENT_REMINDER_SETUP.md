# 💰 Hệ Thống Nhắc Nhở Thanh Toán Qua Email

## 🎯 Mô Tả

Hệ thống **tự động** gửi email nhắc nhở người thuê thanh toán tiền phòng hàng tháng.

### ✨ Tính Năng
- ✅ Gửi email tự động theo ngày cài đặt (mặc định: ngày 25 mỗi tháng)
- ✅ Liệt kê chi tiết các hóa đơn chưa thanh toán
- ✅ Theo dõi lịch sử gửi email
- ✅ Hỗ trợ gửi manual (test)
- ✅ Email đẹp, chuyên nghiệp với HTML

---

## 🚀 Cách Thiết Lập

### Bước 1: Cập Nhật Database

Chạy function trong Google Apps Script:

```javascript
initDatabase()
```

Điều này sẽ tạo:
- **Sheet mới:** `PaymentReminders` (lưu lịch sử gửi)
- **Cột mới trong Tenants:** `PaymentReminderDay` (ngày gửi nhắc nhở, mặc định 25)

### Bước 2: Setup Automatic Trigger

Chạy function này **1 lần duy nhất**:

```javascript
setupPaymentReminderTrigger()
```

**Output:**
```json
{
  "success": true,
  "message": "Trigger setup successfully! Reminders will be sent daily at 8 AM."
}
```

✅ Lúc này Google Apps Script sẽ **tự động chạy hàng ngày lúc 8 AM** để kiểm tra và gửi email!

---

## 📧 Cách Hoạt Động

### Timeline Hàng Ngày

```
8:00 AM (Hàng Ngày)
    ↓
checkAndSendPaymentReminders() chạy
    ↓
Kiểm tra: Hôm nay là ngày mấy?
    ↓
Nếu hôm nay = ngày cài đặt (ví dụ: ngày 25)
    ↓
Tìm tất cả tenant có PaymentReminderDay = 25
    ↓
Tìm hóa đơn chưa thanh toán của họ
    ↓
Gửi email nhắc nhở
    ↓
Log vào sheet "PaymentReminders"
```

---

## 🎨 Email Mẫu

Email sẽ trông như thế này:

```
💰 Nhắc Nhở: Thanh Toán Tiền Phòng Tháng Này

Xin chào Nguyễn Văn A,

Chúng tôi nhắc nhở bạn rằng bạn có 1 hóa đơn chưa thanh toán:

┌────────────────────────────────────┐
│ Tháng │ Năm │ Số Tiền             │
├────────────────────────────────────┤
│ 4     │ 2026│ 5,100,000₫          │
├────────────────────────────────────┤
│ Tổng Cộng: 5,100,000₫             │
└────────────────────────────────────┘

⏰ Vui lòng thanh toán trước cuối tháng để tránh các phí phạt.

Nếu bạn đã thanh toán, vui lòng bỏ qua thông báo này.
Liên hệ quản lý nếu có bất kỳ thắc mắc nào.
```

---

## 🛠️ Các API Functions

### 1. **setupPaymentReminderTrigger()**
**Mục đích:** Setup automatic trigger chạy hàng ngày

```json
{
  "action": "setupPaymentReminderTrigger"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trigger setup successfully! Reminders will be sent daily at 8 AM."
}
```

---

### 2. **checkAndSendPaymentReminders()**
**Mục đích:** Kiểm tra và gửi reminders (chạy tự động hàng ngày)

```json
{
  "action": "checkAndSendPaymentReminders"
}
```

**Response:**
```json
{
  "success": true,
  "remindersSent": 5,
  "message": "Checked and sent 5 reminders"
}
```

---

### 3. **sendManualPaymentReminder(tenantId)**
**Mục đích:** Gửi email ngay lập tức cho 1 tenant (dùng để test)

```json
{
  "action": "sendManualPaymentReminder",
  "params": {
    "tenantId": "TENANT-123456-789"
  }
}
```

**Response:**
```json
{
  "success": true,
  "reminderId": "REM-654321-456",
  "message": "Email sent successfully to Nguyễn Văn A"
}
```

---

### 4. **getPaymentReminderHistory(tenantId)**
**Mục đích:** Xem lịch sử gửi email cho tenant

```json
{
  "action": "getPaymentReminderHistory",
  "params": {
    "tenantId": "TENANT-123456-789"
  }
}
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "reminderId": "REM-111111-111",
      "tenantId": "TENANT-123456-789",
      "month": 4,
      "year": 2026,
      "reminderType": "Email",
      "scheduledDate": "25/04/2026",
      "status": "Sent",
      "sentDate": "25/04/2026 08:00 AM",
      "response": "Success"
    }
  ],
  "count": 1
}
```

---

## 📋 Cài Đặt Ngày Nhắc Nhở

### Thay Đổi Ngày Nhắc Nhở Cho Tenant

**Hiện tại:** Mặc định ngày 25 mỗi tháng

**Để thay đổi:**
1. Vào Google Sheet `Tenants`
2. Tìm cột `PaymentReminderDay`
3. Thay đổi số (ví dụ: 20, 25, 30)
4. Save

### Ví Dụ
```
Nguyễn Văn A → PaymentReminderDay = 20 → Email gửi ngày 20
Nguyễn Văn B → PaymentReminderDay = 25 → Email gửi ngày 25
Nguyễn Văn C → PaymentReminderDay = 30 → Email gửi ngày 30
```

---

## 📊 Sheet "PaymentReminders"

Mỗi lần gửi email, hệ thống tự động lưu vào sheet này:

| ReminderID | TenantID | Month | Year | Type  | ScheduledDate | Status | SentDate | Message | Response |
|-----------|---------|-------|------|-------|---------------|--------|----------|---------|----------|
| REM-111-111 | TENANT-123 | 4 | 2026 | Email | 25/04/2026 | Sent | 25/04/2026 | [HTML Content] | Success |
| REM-222-222 | TENANT-456 | 4 | 2026 | Email | 25/04/2026 | Sent | 25/04/2026 | [HTML Content] | Success |
| REM-333-333 | TENANT-789 | 4 | 2026 | Email | 25/04/2026 | Failed | - | - | Email not provided |

---

## 🧪 Test

### Test Manual (Cách 1)
```javascript
// Chạy trong Google Apps Script Console
sendManualPaymentReminder("TENANT-123456-789")
```

### Test Manual (Cách 2 - Qua Frontend)
```json
POST /usercodeapp

{
  "action": "sendManualPaymentReminder",
  "params": {
    "tenantId": "TENANT-123456-789"
  }
}
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Email phải có:** Tenant phải có email trong sheet Tenants
2. **Hóa đơn phải có:** Phải có hóa đơn chưa thanh toán (PaymentStatus = "Chưa thu")
3. **Trigger chạy lúc 8 AM:** Đảm bảo Google Apps Script account chạy 24/7
4. **Kiểm tra limit:** Google Apps Script có giới hạn gửi email (~100/ngày)

---

## 🔧 Troubleshooting

### ❌ Email không được gửi
**Nguyên nhân:**
- Tenant không có email
- Hóa đơn không tồn tại
- Email format không đúng
- Vượt giới hạn gửi email

**Giải pháp:**
- Kiểm tra sheet Tenants có email không
- Kiểm tra PaymentStatus = "Chưa thu"
- Xem log trong PaymentReminders sheet

### ❌ Trigger không chạy tự động
**Nguyên nhân:**
- Chưa chạy `setupPaymentReminderTrigger()`
- Google Apps Script permissions không được cấp

**Giải pháp:**
- Chạy lại `setupPaymentReminderTrigger()`
- Kiểm tra Triggers trong Google Apps Script

---

## 📝 Cấu Trúc Dữ Liệu

### Sheet: Tenants
```
TenantID | PropertyID | FullName | Phone | IDCard | Email | RoomID | PaymentReminderDay | JoinDate
↑        ↑           ↑          ↑       ↑        ↑       ↑       ↑                    ↑
0        1           2          3       4        5       6       7                    8
```

### Sheet: PaymentReminders
```
ReminderID | TenantID | Month | Year | ReminderType | ScheduledDate | Status | SentDate | Message | Response
↑          ↑          ↑       ↑     ↑              ↑               ↑        ↑         ↑        ↑
0          1          2       3     4              5               6        7         8        9
```

---

## 🚀 Tiếp Theo

- [ ] Thêm Zalo/Whatsapp notification (Phase 2)
- [ ] Thêm SMS notification (Phase 2)
- [ ] Thêm multiple reminders (ngày 20, 25, 30)
- [ ] Dashboard hiển thị trạng thái gửi

---

**Bắt đầu sử dụng:**
```javascript
setupPaymentReminderTrigger()  // Chạy 1 lần
```

✅ Hoàn tất! Hệ thống sẽ gửi email tự động hàng ngày!
