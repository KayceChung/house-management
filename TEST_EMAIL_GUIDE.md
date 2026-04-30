# 📧 Hướng Dẫn Test Email

Có 2 cách để test gửi email:

## 🚀 Cách 1: Chạy trong Google Apps Script (Nhanh nhất - Recommended)

### Bước 1: Vào Google Apps Script
1. Mở Google Sheet "HOUSE-MANAGEMENT"
2. Click **Extensions → Apps Script**
3. Paste toàn bộ Code.gs mới (nếu chưa update)

### Bước 2: Chạy function test
1. Trong Google Apps Script editor, click **Select function** dropdown
2. Chọn **`sendTestEmail`**
3. Click **▶️ Run** button

### Bước 3: Cấp quyền
- Sẽ hiện pop-up "Review permissions"
- Click **Review permissions**
- Chọn tài khoản Google của bạn
- Click **Allow** (cho phép GAS gửi email)

### Bước 4: Kiểm tra
- **Logs sẽ hiện:** "Test email sent to: chunghienkhang@gmail.com"
- **Inbox của bạn sẽ nhận email test**
- Email sẽ có tiêu đề: "🧪 Test Email - Hệ Thống Quản Lý Nhà Trọ"

---

## 🌐 Cách 2: Gửi từ Frontend (test-email.html)

### Bước 1: Deploy Google Apps Script
1. Vào Google Apps Script
2. Click **Deploy** button
3. Chọn **New deployment**
4. Type: **Web app**
   - Execute as: Your Google Account
   - Allow access to: **Anyone**
5. Click **Deploy**
6. **Copy URL** được hiển thị (dạng: `https://script.google.com/macros/s/.../usercodeapp`)

### Bước 2: Cập nhật config.js
```javascript
window.CONFIG = {
    API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/usercodeapp',
    // ... rest of config
};
```

### Bước 3: Mở test-email.html
1. Mở file `test-email.html` trong trình duyệt
2. Nhập email: `chunghienkhang@gmail.com`
3. Click **🚀 Gửi Test Email**
4. Kiểm tra inbox

---

## ✅ Email Test Sẽ Chứa

- ✓ Tiêu đề: "🧪 Test Email - Hệ Thống Quản Lý Nhà Trọ"
- ✓ Giao diện HTML đẹp
- ✓ Thông tin: Email, thời gian gửi, Spreadsheet ID
- ✓ Xác nhận: "Hệ thống email đã sẵn sàng"

---

## 🔍 Nếu Email Không Đến

### Kiểm tra:
1. **Gmail spam folder** - Email có thể vào spam
2. **Log trong Google Apps Script** - Click **Execution log** để xem lỗi
3. **Permission** - Có cấp quyền send email cho GAS không?
4. **API_URL** - Config.js có URL đúng không? (nếu dùng Cách 2)

---

## 🎯 Tiếp Theo Sau Khi Test Thành Công

Khi test email OK, bạn có thể:

1. **Setup automatic reminders:**
   ```javascript
   setupPaymentReminderTrigger()
   ```
   → Sẽ gửi email tự động mỗi ngày lúc 8 AM

2. **Thêm người thuê với ngày nhắc nhở:**
   ```
   PaymentReminderDay = 25 (mặc định)
   ```
   → Ngày 25 hàng tháng sẽ gửi nhắc nhở

3. **Gửi nhắc nhở manual:**
   ```javascript
   sendManualPaymentReminder('TENANT-ID')
   ```

---

## 📞 Liên Hệ & Support

Nếu có vấn đề, check:
- Google Apps Script Logs (Ctrl + Enter)
- Email có nằm trong Spam không
- Permission setting của GAS
