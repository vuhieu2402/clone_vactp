# Angular + Tailwind CSS + ng-zorro Project

Đây là một project Angular được tạo với Angular CLI, sử dụng Tailwind CSS cho styling và ng-zorro (Ant Design) cho UI components.

## Công nghệ sử dụng

- **Angular 16**: Framework frontend chính
- **Tailwind CSS**: Utility-first CSS framework
- **ng-zorro-antd**: Ant Design components cho Angular
- **TypeScript**: Ngôn ngữ lập trình chính

## ⚠️ QUAN TRỌNG: Thiết lập Background Image

**Để hiển thị đúng background cho trang login:**

1. **Copy ảnh background** `bg_tpb.png` vào thư mục: `src/assets/`
2. **Đường dẫn cuối cầu**: `src/assets/bg_tpb.png`
3. **Nếu chưa có ảnh**: Hiện tại đang sử dụng gradient CSS fallback

```bash
# Cấu trúc thư mục assets
src/assets/
├── bg_tpb.png          # <- Copy ảnh vào đây
└── .gitkeep
```

## Cài đặt và chạy project

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
ng serve
```

Sau đó mở trình duyệt và truy cập `http://localhost:4200/`

### 3. Build project cho production
```bash
ng build
```

## Cấu trúc project

```
src/
├── app/
│   ├── components/
│   │   └── login/
│   │       ├── login.component.html    # Giao diện login
│   │       ├── login.component.css     # Custom styles
│   │       └── login.component.ts      # Component logic
│   ├── app.component.html    # Template chính
│   ├── app.component.ts      # Component logic
│   ├── app.module.ts         # Module chính với ng-zorro imports
│   └── app-routing.module.ts # Routing configuration
├── assets/
│   └── bg_tpb.png           # Background image (cần copy)
├── styles.css                # Global styles với Tailwind directives
└── ...
```

## Tính năng demo

Project này demo các tính năng sau:

### 1. Giao diện Login Professional
- **Background**: Futuristic city image với fallback gradient
- **Glassmorphism**: Hiệu ứng kính mờ cho form
- **Animations**: Logo pulse, card slide-up, floating elements
- **Responsive Design**: Hoạt động trên mọi thiết bị

### 2. ng-zorro Components
- **Form**: Input fields với prefix icons
- **Buttons**: Gradient buttons với hover effects
- **Cards**: Glass-morphism cards
- **Checkbox**: Remember login option
- **Divider**: Social login separator

### 3. Kết hợp Tailwind + ng-zorro
- Sử dụng Tailwind classes cùng với ng-zorro components
- Custom CSS cho advanced effects
- Responsive design với Tailwind grid

## Cấu hình quan trọng

### Tailwind CSS Configuration

File `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Tắt để tránh xung đột với ng-zorro
  }
}
```

### Global Styles

File `src/styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### ng-zorro Modules

Trong `app.module.ts`, các modules được import:
- NzButtonModule
- NzCardModule  
- NzFormModule
- NzInputModule
- NzCheckboxModule
- NzDividerModule
- NzIconModule

## Lưu ý khi phát triển

1. **Background Image**: Copy ảnh `bg_tpb.png` vào `src/assets/`
2. **Tailwind Preflight**: Đã tắt `preflight` để tránh xung đột với ng-zorro styles
3. **Content Path**: Tailwind được cấu hình để scan các file `.html` và `.ts`
4. **Module Import**: Chỉ import các ng-zorro modules cần thiết để giảm bundle size
5. **Responsive**: Sử dụng Tailwind responsive classes (`md:`, `lg:`, etc.)

## Routes

- `/login` - Trang đăng nhập (default route)
- `/` - Redirect về `/login`

## Commands hữu ích

```bash
# Chạy development server
ng serve

# Build cho production
ng build --prod

# Chạy tests
ng test

# Generate component mới
ng generate component component-name

# Generate service mới  
ng generate service service-name
```

## Tài liệu tham khảo

- [Angular Documentation](https://angular.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ng-zorro Documentation](https://ng.ant.design/docs/introduce/en)
