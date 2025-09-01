# Virtual Wallet System Documentation

## Overview

The Virtual Wallet System solves the money flow tracking problem in your multitenant marketplace. Instead of manually tracking who owes what, this system automatically:

1. **Tracks all vendor earnings** from each sale
2. **Calculates platform commissions** automatically
3. **Manages payout requests** from vendors
4. **Provides complete financial transparency**

## Current Money Flow Problem

**Before (Current State):**

- ✅ Customer pays via PayPal → Money goes to your main account
- ❌ No automatic tracking of vendor earnings
- ❌ No commission calculation
- ❌ No payout management system
- ❌ Manual spreadsheet tracking required

**After (With Virtual Wallets):**

- ✅ Customer pays via PayPal → Money goes to your main account
- ✅ System automatically tracks vendor earnings after commission
- ✅ Vendors can see their balance and request payouts
- ✅ Complete audit trail of all transactions
- ✅ Automated commission calculations

## System Components

### 1. Collections Added

#### **Wallets Collection**

- One wallet per vendor/tenant
- Tracks available balance, pending balance, total earnings
- Configurable commission rates and hold periods
- PayPal/bank details for payouts

#### **WalletTransactions Collection**

- Records every financial transaction
- Types: earnings, payouts, refunds, adjustments
- Links to orders for complete traceability
- Tracks commission amounts

#### **Payouts Collection**

- Manages payout requests from vendors
- Supports PayPal and manual bank transfers
- Tracks payout status and processing

### 2. Enhanced Orders Collection

- Added `tenant` field to link orders to vendors
- Added `platformCommission` and `vendorEarning` fields
- Added `walletTransactionProcessed` flag

### 3. Wallet Service (`/src/lib/wallet-service.ts`)

Core business logic for:

- Processing earnings from completed orders
- Managing hold periods for fraud protection
- Handling payout requests
- Calculating commissions

### 4. API Endpoints

#### **GET /api/wallet**

Returns vendor's wallet data:

```json
{
  "balance": {
    "available": 150.00,
    "pending": 50.00,
    "total": 200.00
  },
  "transactions": [...],
  "pendingPayouts": [...]
}
```

#### **POST /api/wallet/payout**

Request a payout:

```json
{
  "amount": 100.0
}
```

### 5. Wallet Dashboard Component

Complete UI for vendors to:

- View their earnings and balances
- Request payouts
- See transaction history
- Track pending payouts

## How It Works

### When a Sale Happens:

1. **Customer pays** via PayPal → Money goes to your account
2. **Order marked complete** in PayPal capture webhook
3. **Wallet service automatically processes**:
   ```
   Sale Amount: $100.00
   Platform Commission (10%): $10.00
   Vendor Earning: $90.00
   ```
4. **Vendor's pending balance increases** by $90.00
5. **Hold period starts** (7 days default for fraud protection)

### After Hold Period:

1. **Funds automatically release** from pending to available
2. **Vendor can request payout** for available balance
3. **You process payout** manually or via PayPal API

### Commission System:

- **Configurable per vendor** (default 10%)
- **Automatic calculation** on every sale
- **Transparent tracking** - vendors see gross vs net amounts
- **Platform keeps commission** automatically

## Implementation Status

### ✅ Completed:

- Virtual wallet database schema
- Automatic earnings processing
- Commission calculations
- Payout request system
- Wallet dashboard UI
- API endpoints
- PayPal integration hooks

### 📋 Next Steps:

1. **Add wallet collections to PayloadCMS** (already done in config)
2. **Update order creation** to include tenant ID
3. **Deploy and test** the system
4. **Create admin dashboard** for managing payouts
5. **Optional: PayPal automated payouts**

## Configuration

### Default Settings:

- **Commission Rate**: 10% (configurable per vendor)
- **Hold Period**: 7 days (configurable per vendor)
- **Minimum Payout**: None (can be added)

### Customization:

```typescript
// In wallet creation
{
  commissionRate: 0.15, // 15%
  holdPeriodDays: 14,    // 14 days hold
}
```

## Benefits

### For You (Platform Owner):

- ✅ **Automated commission collection**
- ✅ **Complete financial tracking**
- ✅ **Fraud protection with hold periods**
- ✅ **Reduced manual work**
- ✅ **Professional vendor relations**

### For Vendors:

- ✅ **Real-time earnings visibility**
- ✅ **Self-service payout requests**
- ✅ **Transparent commission structure**
- ✅ **Professional payment experience**

### For Customers:

- ✅ **Same seamless PayPal checkout**
- ✅ **No changes to buying experience**

## Security Features

- **Hold periods** prevent fraud losses
- **Audit trails** for all transactions
- **Role-based access** (vendors only see their data)
- **Payout verification** before processing

## Usage Example

```typescript
// After PayPal payment completes
await walletService.processOrderEarning(orderId);

// Vendor requests payout
const payoutId = await walletService.requestPayout(walletId, 250.0);

// Check vendor balance
const balance = await walletService.getWalletBalance(tenantId);
// Returns: { available: 150, pending: 50, total: 200 }
```

## Admin Tasks

### Daily/Weekly:

1. **Review payout requests** in PayloadCMS admin
2. **Process approved payouts** via PayPal/bank
3. **Monitor commission collection**

### Monthly:

1. **Review vendor performance**
2. **Adjust commission rates** if needed
3. **Generate financial reports**

This system transforms your manual tracking into a fully automated, professional financial management platform! 🎉
