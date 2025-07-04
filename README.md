# ChainCal 🔗📅

**Your on-chain calendar assistant that never misses a blockchain event.**

A powerful Farcaster Mini App that captures on-chain events and delivers seamless notifications via email, Frame interactions, and calendar integrations. Perfect for DeFi users, developers, and anyone who needs to stay on top of blockchain activity.

## What is ChainCal?

ChainCal is a comprehensive blockchain event monitoring and notification platform that:

- **🔔 Captures real-time blockchain events** via Alchemy webhooks
- **📧 Sends smart email reminders** when events are due
- **🖼️ Displays events in Farcaster Frames** with interactive snooze buttons
- **📅 Provides iCal feeds** for seamless calendar integration
- **⚡ Manages event scheduling** with Redis-powered queue system

Never miss another important on-chain event - from token transfers to governance votes to DeFi liquidations.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (we recommend [Supabase](https://supabase.com))
- Redis instance (we recommend [Upstash](https://upstash.com))
- [Alchemy](https://alchemy.com) account for webhooks

### 1. Clone and Install

```bash
git clone https://github.com/NaniSkinner/FarcasterMiniApp.git
cd FarcasterMiniApp
pnpm install
```

### 2. Environment Setup

```bash
cp env.example .env
# Edit .env with your actual values
```

### 3. Start All Services

```bash
# Terminal 1: Webhook Listener (Port 3000)
pnpm --filter @chaincal/listener dev

# Terminal 2: API Service (Port 3001)
pnpm --filter @chaincal/api dev

# Terminal 3: Farcaster Frame (Port 3002)
pnpm --filter @chaincal/frame dev

# Terminal 4: Web Dashboard (Port 3003)
pnpm --filter @chaincal/web dev

# Terminal 5: Scheduler Service
pnpm --filter @chaincal/scheduler dev
```

### 4. Test the System

1. **Create an event**: Visit `http://localhost:3003/events`
2. **View in Frame**: Check `http://localhost:3002/api/frame`
3. **Subscribe to calendar**: Download the iCal feed at `http://localhost:3001/calendar.ics`

## ✨ Features

### 🔗 **Blockchain Integration**

- Real-time event capture via Alchemy webhooks
- Support for any EVM-compatible chain
- Secure webhook signature validation

### 📧 **Smart Notifications**

- Beautiful HTML email templates
- Console mode for development
- Gmail SMTP and custom provider support
- Configurable reminder schedules

### 🖼️ **Farcaster Frame**

- Interactive event display
- One-click snooze functionality
- Real-time event updates
- Mobile-optimized interface

### 📅 **Calendar Integration**

- Dynamic iCal feed generation
- Compatible with Google Calendar, Apple Calendar, Outlook
- Automatic event synchronization
- Rich event metadata

### 🌐 **Web Dashboard**

- Beautiful SvelteKit interface
- Event management and statistics
- Preset contract templates
- Real-time data visualization

## 🏗️ Architecture

ChainCal uses a modern microservices architecture:

```
Blockchain Event → Alchemy Webhook → Listener Service → PostgreSQL
                                                            ↓
Calendar Apps ← iCal Feed ← API Service ← Scheduler ← Redis Queue
                                          ↓
                                    Email Notifications
```

### Services

- **🎯 Webhook Listener** (Port 3000): Captures blockchain events
- **🚀 API Service** (Port 3001): REST endpoints + iCal feed
- **🖼️ Farcaster Frame** (Port 3002): Interactive event display
- **📧 Scheduler Service**: Background email notifications
- **🌐 Web Dashboard** (Port 3003): Event management interface

## 📋 Configuration

All configuration is done via environment variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Alchemy
ALCHEMY_API_KEY=your-alchemy-api-key
ALCHEMY_SIGNING_KEY=your-webhook-signing-key

# Email (Choose one)
EMAIL_MODE=console                    # For development
SMTP_HOST=smtp.gmail.com             # For Gmail
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
DEFAULT_EMAIL=recipient@example.com
```

## 🎯 Use Cases

### **DeFi Monitoring**

- Track liquidation events
- Monitor yield farm rewards
- Get notified of governance proposals

### **NFT Collection Management**

- Track mints and transfers
- Monitor floor price changes
- Get alerts for rare trait listings

### **Development & Testing**

- Monitor smart contract events
- Track deployment confirmations
- Debug transaction flows

### **Portfolio Management**

- Track token transfers
- Monitor staking rewards
- Get notified of large movements

## 🚦 System Status

✅ **MVP Complete** - All core features implemented and working  
✅ **End-to-End Tested** - Full data pipeline verified  
✅ **Production Ready** - All services stable and interconnected  
🚀 **Ready for Testing** - Invite your team to try it out!

## 🧪 Testing Your Setup

The system includes comprehensive health checks:

```bash
# Test API health
curl http://localhost:3001/health

# Test iCal feed
curl http://localhost:3001/calendar.ics

# Test Frame
curl http://localhost:3002/api/frame
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: SvelteKit + Tailwind CSS
- **Frame**: Next.js + frames.js
- **Database**: PostgreSQL + Redis
- **Blockchain**: Alchemy webhooks
- **Package Manager**: pnpm workspaces

## 📚 Documentation

- [📖 Project Overview](_docs/project-overview.md)
- [🎯 Product Requirements](_docs/PRD.md)
- [✅ Task Progress](_docs/tasks.md)
- [⚡ Alchemy Integration](_docs/Alchemy.md)
- [🤔 Technical Considerations](_docs/considerations.md)

## 🤝 Contributing

We'd love your help making ChainCal better! Here are some ways to contribute:

### **Ideas for Contributions**

- 🔄 **Cross-chain support** (Polygon, Base, Arbitrum)
- 🔐 **Wallet authentication** with Sign-In with Ethereum
- 📱 **Mobile push notifications**
- 🎨 **Custom email templates**
- 📊 **Analytics dashboard**
- 🔗 **More blockchain integrations**

### **How to Contribute**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built for the blockchain community with ❤️

- [Alchemy](https://alchemy.com) for reliable blockchain infrastructure
- [Farcaster](https://farcaster.xyz) for the amazing Frame ecosystem
- [Supabase](https://supabase.com) for seamless database hosting
- [Upstash](https://upstash.com) for Redis-as-a-Service

---

**Ready to never miss another on-chain event?** [Get started now!](#-quick-start)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NaniSkinner/FarcasterMiniApp)
