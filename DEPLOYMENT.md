# 🚀 Hướng Dẫn Triển Khai (Deployment Guide)

## 📋 Yêu Cầu Trước
- Một Google Account (để dùng Google Sheets + Google Apps Script)
- Một Vercel Account (https://vercel.com) - miễn phí
- Git đã cài đặt
- GitHub Account (để push code lên Vercel)

---

## 🔧 Bước 1: Cấu Hình Google Apps Script

### 1.1. Chuẩn Bị Google Sheet
1. Tạo Google Sheet mới hoặc mở sheet "HOUSE-MANAGEMENT"
2. Ghi chú **Spreadsheet ID** (trong URL: `/spreadsheets/d/{SPREADSHEET_ID}/`)

### 1.2. Tạo Apps Script Project
1. Mở Google Sheet của bạn
2. Chọn **Extensions** → **Apps Script**
3. Xóa tất cả code mặc định
4. **Copy-paste toàn bộ nội dung của file `Code.gs`** vào editor
5. Click **Save**

### 1.3. Chạy Khởi Tạo Database
1. Click dropdown **Select function** (giữa Save và Execute)
2. Chọn **initDatabase**
3. Click **Run** (nút ▶️ Execute)
4. Google sẽ yêu cầu quyền - click **Review permissions** → **Allow**
5. Kiểm tra Google Sheet của bạn - bạn sẽ thấy 6 sheet mới:
   - Rooms
   - Tenants
   - Contracts
   - UtilityUsage
   - Transactions
   - Assets

### 1.4. Deploy Web App
1. Click **Deploy** (nút bên cạnh Save)
2. Chọn **+ New deployment**
3. **Deployment type**: Chọn **Web app**
4. **Execute as**: Chọn email của bạn
5. **Who has access**: Chọn **Anyone** (để public)
6. Click **Deploy**
7. **Copy URL** được cung cấp (ví dụ: `https://script.google.com/macros/s/AKfycb...abc/usercodeapp`)
8. Lưu lại URL này - bạn sẽ cần nó!

---

## 📁 Bước 2: Chuẩn Bị Frontend cho Vercel

### 2.1. Cấu Hình API URL
1. Mở file **`config.js`**
2. Thay `YOUR_SCRIPT_ID_HERE` bằng **Deployment URL** từ bước 1.4
3. Ví dụ:
   ```javascript
   API_URL: 'https://script.google.com/macros/s/AKfycb...abc/usercodeapp'
   ```
4. Save file

### 2.2. Kiểm Tra Tệp Vercel
Đảm bảo project folder có các file này:
- ✅ `index.html` - Frontend chính
- ✅ `api.js` - Logic API
- ✅ `config.js` - Cấu hình (đã cập nhật)
- ✅ `vercel.json` - Cấu hình Vercel
- ✅ `package.json` - Node.js config
- ✅ `Code.gs` - Backend Google Apps Script
- ✅ `.gitignore` - Ignore files
- ✅ `.env.example` - Ví dụ environment variables

---

## 🌐 Bước 3: Deploy lên Vercel

### 3.1. Tạo Git Repository
1. Mở Terminal/PowerShell tại folder project
2. Chạy lệnh:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: House Management System"
   ```

### 3.2. Push lên GitHub
1. Tạo repository mới trên GitHub.com (ví dụ: `house-management-system`)
2. Chạy lệnh:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/house-management-system.git
   git branch -M main
   git push -u origin main
   ```

### 3.3. Deploy trên Vercel
1. Vào https://vercel.com/new
2. **Import Project** → **Import from Git**
3. **Select GitHub Account** → Chọn GitHub account của bạn
4. **Select Repository** → Chọn `house-management-system`
5. **Configure Project**:
   - **Framework**: None (Static)
   - **Root Directory**: ./
   - Không cần thêm environment variables
6. Click **Deploy**
7. Vercel sẽ build và deploy project
8. **Copy URL** được cung cấp (ví dụ: `https://house-management-system.vercel.app`)

---

## ✅ Bước 4: Kiểm Tra Hệ Thống

### 4.1. Test Frontend
1. Mở URL Vercel của bạn
2. Bạn sẽ thấy Dashboard với các stat cards
3. Mở **Chrome DevTools** (F12) → **Console**
4. Nếu có cảnh báo "API_URL not configured" - quay lại Bước 2.1 để cấu hình

### 4.2. Test Thêm Phòng
1. Vào tab **Quản Lý Phòng**
2. Click **Thêm Phòng**
3. Điền thông tin (Tên: "Phòng 101", Tầng: 1, Giá: 3000000)
4. Click **Thêm Phòng**
5. ✅ Nếu thành công → Phòng sẽ xuất hiện trong bảng
6. Kiểm tra Google Sheet "Rooms" - bạn sẽ thấy dữ liệu mới

### 4.3. Test Báo Cáo Điện Nước
1. Vào tab **Điện Nước**
2. Chọn phòng, nhập chỉ số điện/nước
3. Click **Lưu Báo Cáo**
4. Kiểm tra Google Sheet "UtilityUsage" - dữ liệu được lưu

---

## 🔄 Cập Nhật Hệ Thống

### Cập Nhật Backend
1. Chỉnh sửa `Code.gs` nếu cần
2. Copy-paste toàn bộ vào Google Apps Script editor
3. Click Save

### Cập Nhật Frontend
1. Chỉnh sửa các file HTML/JS/CSS
2. Chạy:
   ```bash
   git add .
   git commit -m "Update message"
   git push
   ```
3. Vercel sẽ tự động deploy

---

## 🆘 Troubleshooting

### ❌ "API không được cấu hình"
**Nguyên nhân**: File `config.js` chưa được cập nhật  
**Cách fix**: 
1. Mở `config.js`
2. Thay `YOUR_SCRIPT_ID_HERE` bằng deployment URL
3. Save và reload trang

### ❌ "CORS Error"
**Nguyên nhân**: Google Apps Script phải được deploy với public access  
**Cách fix**: 
1. Vào Google Apps Script
2. Click Deploy → Manage deployments
3. Chọn deployment hiện tại
4. Kiểm tra "Who has access" = "Anyone"
5. Nếu không, click **Edit** → chọn **Anyone** → **Update**

### ❌ "Sheet not found"
**Nguyên nhân**: `initDatabase()` chưa được chạy  
**Cách fix**: 
1. Vào Google Apps Script
2. Chọn function **initDatabase**
3. Click Run
4. Verify 6 sheets được tạo

### ❌ Dữ liệu không xuất hiện trong bảng
**Cách debug**:
1. Mở Console (F12)
2. Check API response - có lỗi không?
3. Kiểm tra Google Sheet - dữ liệu có được lưu không?

---

## 📚 Tài Liệu Thêm

- [Vercel Docs](https://vercel.com/docs)
- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.3/)

---

## 🎉 Hoàn Thành!

Hệ thống của bạn đã được triển khai và sẵn sàng sử dụng. 

**Đặc điểm chính**:
- ✅ Frontend trên Vercel (miễn phí, tự động deploy, HTTPS)
- ✅ Backend trên Google Apps Script (miễn phí)
- ✅ Database trên Google Sheets (miễn phí, easy backup)
- ✅ Responsive design (mobile-friendly)
- ✅ Giao diện đẹp với animations

Thưởng thức! 🚀
