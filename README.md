# HelpD Logistics Support App
**Built with: deepseek-v4.1-flash via Hermes Agent on September 14, 2026**

A modern, multilingual logistics support application designed for factory workers, FLS (First Line Support), and administrators. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Multi-language Support**: English, German, Spanish, and Italian
- **Role-based Access**: Worker, FLS, and Admin interfaces
- **Real-time Issue Tracking**: Report and monitor production issues
- **PWA Support**: Progressive Web App with offline capabilities
- **Responsive Design**: Mobile-first design for factory floor use
- **Local Storage**: Data persistence without external database

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **PWA**: next-pwa
- **Icons**: Lucide React
- **Build Tool**: Next.js App Router

## 📱 User Roles

### 👷 Worker Interface
- Report production issues
- Track issue duration
- Request FLS assistance
- Add notes to issues
- Select workplace station

### 👨‍💼 FLS Interface
- Monitor active issues
- Escalate critical problems
- Add resolution notes
- Track issue history
- Real-time updates

### 👑 Admin Interface
- System overview dashboard
- Issue type management
- Workplace configuration
- Escalated issue handling
- Performance analytics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd helpd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌍 Internationalization

The app supports multiple languages:
- **English** (`/en`) - Default language
- **German** (`/de`) - Deutsch
- **Spanish** (`/es`) - Español  
- **Italian** (`/it`) - Italiano

Language files are located in `messages/` directory.

## 📁 Project Structure

```
helpd/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes
│   │   ├── admin/         # Admin interface
│   │   ├── fls/           # FLS interface
│   │   ├── worker/        # Worker interface
│   │   └── layout.tsx     # Localized layout
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/             # Reusable components
├── messages/               # Translation files
├── i18n/                  # Internationalization config
├── public/                 # Static assets
└── package.json           # Dependencies
```

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality.

### PWA Configuration
- Service worker automatically generated
- Offline support enabled
- App manifest included

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Static Export (for static hosting)
The app is configured for static export and can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

### Hostinger Deployment
For Hostinger hosting, additional configuration may be required due to Node.js limitations.

## 🧪 Testing

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Test different user roles**
   - Navigate to `/en/worker` for worker interface
   - Navigate to `/en/fls` for FLS interface
   - Navigate to `/en/admin` for admin interface

3. **Test language switching**
   - Use the language switcher in the header
   - Verify all content is properly translated

4. **Test PWA features**
   - Install the app on mobile devices
   - Test offline functionality

## 🐛 Known Issues

- None currently identified

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Version History

- **v0.1.0** - Initial release with core functionality
  - Multi-language support
  - Role-based interfaces
  - Issue tracking system
  - PWA capabilities

---

**Built with ❤️ for modern logistics operations**
