# StabilityScore - Financial Risk Scanner

A production-ready mobile app built with Expo React Native that calculates your Financial Stability Index (FSI) based on your financial obligations, liquidity, EMI concentration, and income stability.

## 🎯 Features

### 1. **Dashboard**
- Display Financial Stability Index (FSI) with circular progress indicator
- Show risk category (Structurally Strong, Stable, Sensitive, High Exposure, Fragile)
- Display monthly income, total obligations, and disposable income
- Breakdown of FSI score components with visual progress bars

### 2. **Obligations Management**
- Add, edit, and delete financial obligations
- Categories: EMI, Subscription, Insurance, Fixed Expense
- Set monthly amounts and due dates
- Color-coded icons for each category

### 3. **Financial Profile**
- Set monthly income
- Set emergency savings
- Choose income type (Salaried, Business, Freelance)
- Beautiful card-based UI

### 4. **Local Notifications**
- Reminder notifications for payment due dates
- Automatically scheduled when you set due dates

## 📊 FSI Calculation

The Financial Stability Index is calculated using four weighted components:

### 1. Obligation Pressure (35% weight)
```
ratio = totalObligations / monthlyIncome
obligationScore = max(0, min(100, 100 * (1 - ratio^1.3)))
```

### 2. Liquidity Coverage (30% weight)
```
coverage = emergencySavings / totalObligations

If coverage >= 12 months → 100
If coverage 6-12 months → 80
If coverage 3-6 months → 60
If coverage 1-3 months → 40
If coverage < 1 month → 20
```

### 3. EMI Concentration (20% weight)
```
emiRatio = emiTotal / totalObligations
emiScore = max(0, 100 - (emiRatio * 60))
```

### 4. Income Stability (15% weight)
```
Salaried → 90
Business → 70
Freelance → 50
```

### Final FSI Score
```
FSI = (obligationScore × 0.35) + 
      (liquidityScore × 0.30) + 
      (emiScore × 0.20) + 
      (incomeScore × 0.15)
```

## 🎨 Risk Categories

| FSI Score | Category | Color |
|-----------|----------|-------|
| 80-100 | Structurally Strong | Green |
| 65-79 | Stable | Light Green |
| 50-64 | Sensitive | Yellow |
| 35-49 | High Exposure | Orange |
| 0-34 | Fragile | Red |

## 🏗️ Project Structure

```
/app/frontend/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard screen
│   │   ├── obligations.tsx    # Obligations management
│   │   ├── profile.tsx        # Profile settings
│   │   └── _layout.tsx        # Tab navigation layout
│   ├── components/
│   │   ├── Button.tsx         # Reusable button component
│   │   ├── Card.tsx           # Card wrapper component
│   │   ├── CircularProgress.tsx # Circular progress indicator
│   │   └── Input.tsx          # Input field component
│   ├── context/
│   │   └── DataContext.tsx    # Global state management
│   ├── services/
│   │   ├── fsiCalculator.ts   # FSI calculation logic
│   │   ├── notifications.ts   # Notification service
│   │   └── storage.ts         # Local storage service
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── _layout.tsx            # Root layout
├── assets/                     # Images and icons
├── app.json                    # Expo configuration
└── package.json                # Dependencies
```

## 📱 Tech Stack

- **Framework**: Expo 54 / React Native
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage (local data persistence)
- **Notifications**: Expo Notifications
- **Icons**: Expo Vector Icons
- **Graphics**: React Native SVG
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn or npm
- Expo Go app (for testing on mobile)

### Installation

1. Navigate to the frontend directory:
```bash
cd /app/frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn start
```

4. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## 📝 Usage Guide

### Step 1: Set Up Your Profile
1. Open the app and tap the **Profile** tab
2. Enter your **Monthly Income** (e.g., ₹50,000)
3. Enter your **Emergency Savings** (e.g., ₹200,000)
4. Select your **Income Type** (Salaried, Business, or Freelance)
5. Tap **Save Profile**

### Step 2: Add Obligations
1. Tap the **Obligations** tab
2. Tap the **+** button
3. Fill in obligation details:
   - Name (e.g., "Home Loan")
   - Category (EMI, Subscription, Insurance, Fixed Expense)
   - Monthly Amount (e.g., ₹15,000)
   - Due Date (optional, e.g., day 5 of month)
4. Tap **Save**

### Step 3: View Your FSI
1. Go to the **Dashboard** tab
2. View your Financial Stability Index score
3. Check your risk category
4. Review the score breakdown

## 🔔 Notifications

The app will send you reminders for:
- Payment due dates for obligations
- Scheduled at 9:00 AM on the due date
- Repeats monthly

**Note**: You need to grant notification permissions when prompted.

## 💾 Data Storage

All data is stored **locally on your device** using AsyncStorage:
- No cloud sync
- No account required
- Complete privacy
- Data persists between app sessions

## 🎯 Best Practices

1. **Keep emergency savings at 6-12 months of expenses**
2. **Minimize EMI obligations** (they have higher risk weight)
3. **Track all recurring expenses** for accurate FSI
4. **Update profile regularly** when income changes
5. **Set due date reminders** to avoid missed payments

## 🔒 Privacy

- **No data collection**: All data stays on your device
- **No analytics**: No tracking or usage statistics
- **No internet required**: Works completely offline
- **No accounts**: No sign-up or login needed

## 📱 Supported Platforms

- ✅ iOS 13+
- ✅ Android 5.0+
- ✅ Web (responsive mobile view)

## 🎨 UI Features

- **Native feel**: Platform-specific components
- **Touch-friendly**: 44pt+ touch targets
- **Smooth animations**: Native performance
- **Intuitive navigation**: Bottom tab bar
- **Visual feedback**: Color-coded risk levels
- **Clean design**: Minimalist Apple-style UI

## 📄 License

This app is production-ready and can be published to the App Store and Google Play.

## 🛠️ Troubleshooting

### Issue: Notifications not working
**Solution**: Go to device Settings → StabilityScore → Enable Notifications

### Issue: Data not persisting
**Solution**: Ensure app has storage permissions

### Issue: FSI score seems incorrect
**Solution**: Double-check all obligations and profile values are entered correctly

## 📞 Support

For issues or questions about the app functionality, check the calculation breakdown on the Dashboard screen to understand your FSI score components.

---

**Built with ❤️ using Expo and React Native**
