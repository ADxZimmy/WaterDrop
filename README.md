# WaterDrop | Fresh Water Marketplace

WaterDrop is a high-performance multi-vendor marketplace platform built with Next.js 15, tailored specifically for the drinking water industry. It connects customers with local water factories and distributors for seamless ordering and delivery.

## 🚀 Features

- **Customer App**: Browse verified vendors, track orders in real-time, and manage subscriptions.
- **Vendor Hub**: Manage products, fulfill orders, and coordinate a delivery fleet.
- **Driver Portal**: Live navigation, inventory management, and earnings tracking.
- **Super Admin**: Platform-wide oversight, vendor verification, and global analytics.
- **Product Drafting**: Built-in vendor-side product description drafting without external AI dependencies.
- **PWA Ready**: Installable on mobile and desktop for an app-like experience.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **Backend**: Firebase (Authentication & Firestore)
- **Charts**: Recharts

## 📦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ADxZimmy/WaterDrop.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file with your Firebase and Gemini API keys.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## Security Notes

- `npm audit --omit=dev` currently reports 8 low-severity vulnerabilities, all in the `firebase-admin` transitive tree.
- The audit-suggested fix is a semver-major move to `firebase-admin@10.3.0`, which is a downgrade from the current `13.7.0` baseline and is not treated as a safe automatic remediation.
- For the current MVP, this remaining audit output is an accepted dependency risk rather than an unreviewed cleanup gap.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ by the WaterDrop Team.
