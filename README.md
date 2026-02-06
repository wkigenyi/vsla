# BANKAYO Lite - VSLA Meeting Management

A mobile-first web application for managing Village Savings and Loan Association (VSLA) meeting sessions, built with Next.js 14 and integrating with Apache Fineract backend.

## Features

### 🎯 Complete Meeting Workflow
- **Step 1: Attendance Tracking** - Mark members as Present, Absent, or Late
- **Step 2: Shares & Social Fund** - Record share purchases with automatic calculations and social fund contributions
- **Step 3: Loan Repayments** - Track loan repayments for members with active loans
- **Step 4: Review & Submit** - Complete financial summary before submission

### 📱 Mobile-First Design
- Touch-friendly interface with large buttons
- Responsive layout for all screen sizes
- Optimized for mobile devices

### 🔄 Offline Sync Queue
- Transactions stored in localStorage when offline
- Automatic retry mechanism for failed requests
- "Pending Sync" badge with manual sync option

### 🔒 Type-Safe Implementation
- Complete TypeScript interfaces for Fineract API
- Strict type checking throughout the codebase

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **State Management:** TanStack Query (React Query)
- **Backend API:** Apache Fineract REST API

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wkigenyi/vsla.git
cd vsla
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
```

4. Configure your Fineract API credentials in `.env.local`:
```env
NEXT_PUBLIC_FINERACT_API_URL=https://your-fineract-instance.com/fineract-provider/api/v1
NEXT_PUBLIC_FINERACT_TENANT=default
NEXT_PUBLIC_FINERACT_USERNAME=your_username
NEXT_PUBLIC_FINERACT_PASSWORD=your_password
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. Navigate to the homepage at `http://localhost:3000`
2. Click "Start Demo Meeting Session" to begin
3. Follow the 4-step workflow:
   - Mark attendance for all members
   - Record share purchases and social fund contributions
   - Enter loan repayments
   - Review and submit the meeting session

## Project Structure

```
vsla/
├── app/                          # Next.js app directory
│   ├── groups/[id]/session/     # Meeting session page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
├── components/
│   ├── meeting/                 # Meeting step components
│   │   ├── attendance-step.tsx
│   │   ├── shares-step.tsx
│   │   ├── repayments-step.tsx
│   │   └── review-step.tsx
│   ├── ui/                      # Shadcn UI components
│   └── query-provider.tsx       # React Query provider
├── lib/
│   ├── api/                     # API clients
│   │   └── fineract.ts         # Fineract API client
│   ├── hooks/                   # Custom React hooks
│   │   └── use-fineract.ts     # Fineract data hooks
│   ├── types/                   # TypeScript types
│   │   └── fineract.ts         # Fineract type definitions
│   ├── sync-queue.ts           # Offline sync queue utilities
│   └── utils.ts                # Utility functions
└── public/                      # Static assets
```

## API Integration

The application integrates with Apache Fineract REST API:

- **Groups:** `GET /groups/{groupId}?associations=clientMembers,savingsAccounts,loans`
- **Attendance:** `POST /groups/{groupId}/meetings/{meetingId}?command=saveAttendance`
- **Deposits:** `POST /savingsaccounts/{id}/transactions?command=deposit`
- **Repayments:** `POST /loans/{id}/transactions?command=repayment`

### Mock Data

When the Fineract API is unavailable, the application falls back to mock data with a demo group containing 4 members.

## Key Features Explained

### Share Counter
- Uses +/- buttons for easy input
- Share price: 5,000 UGX per share
- Automatic amount calculation
- Only available for present members

### Social Fund
- Flat rate: 1,000 UGX per member
- Toggle button for contribution status
- Only available for present members

### Offline Sync Queue
- All transactions stored in `localStorage`
- Retry count tracking (max 3 attempts)
- Status indicators: PENDING, PROCESSING, FAILED
- Manual sync trigger available

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Integrates with [Apache Fineract](https://fineract.apache.org/)