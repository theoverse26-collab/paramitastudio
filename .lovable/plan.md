

## Plan: Admin Transaction History Page

### Overview
Add a new "Transactions" tab to the admin dashboard that displays all game purchases with detailed information including buyer details, game info, payment status, amount, and date.

---

### Part 1: Create Transaction History Component

**New File: `src/components/admin/TransactionHistory.tsx`**

Create a comprehensive transaction history component that:

1. **Fetches all purchases** from the database with related game and user info
2. **Displays in a table format** with columns:
   - Transaction ID (truncated)
   - Date & Time
   - Customer Email
   - Game Title
   - Amount (formatted by currency)
   - Payment Status (with color-coded badges)
   - Payment Gateway
   - Invoice Number

3. **Features:**
   - Loading state while fetching data
   - Status filter dropdown (All, Completed, Pending, Failed)
   - Sorting by date (newest first by default)
   - Pagination for large datasets
   - Color-coded status badges:
     - Completed: Green
     - Pending: Yellow
     - Failed: Red

---

### Part 2: Component Structure

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Transaction History                                                      │
│  ┌─────────────┐                                                         │
│  │ Status: All ▼│  [Filter dropdown]                                     │
│  └─────────────┘                                                         │
├──────────────────────────────────────────────────────────────────────────┤
│  ID      │ Date       │ Customer      │ Game    │ Amount  │ Status │ ... │
├──────────────────────────────────────────────────────────────────────────┤
│  5092... │ Jan 7, '26 │ test@mail.com │ Game A  │ Rp30k   │ ✓ Done │     │
│  5253... │ Jan 7, '26 │ user@mail.com │ Game A  │ Rp30k   │ ✓ Done │     │
│  0f8f... │ Jan 8, '26 │ new@mail.com  │ Game A  │ Rp30k   │ ⏳ Pend│     │
├──────────────────────────────────────────────────────────────────────────┤
│                        < 1 2 3 ... 10 >                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Part 3: Data Fetching Strategy

The component will fetch purchases with related data:

```typescript
// Query purchases with game titles
const { data } = await supabase
  .from('purchases')
  .select(`
    id,
    user_id,
    game_id,
    purchase_date,
    amount,
    payment_status,
    payment_gateway,
    gateway_order_id,
    games (title)
  `)
  .order('purchase_date', { ascending: false });

// Then fetch user emails from profiles table
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, email')
  .in('id', userIds);
```

---

### Part 4: Update Admin Page

**File: `src/pages/Admin.tsx`**

- Import the new `TransactionHistory` component
- Add a 4th tab "Transactions" to the TabsList
- Update grid to `grid-cols-4`
- Add TabsContent for transactions

---

### Part 5: Add Translation Keys

**File: `src/locales/en.json`** - Add under `admin`:

```json
"transactions": {
  "title": "Transaction History",
  "loading": "Loading transactions...",
  "noTransactions": "No transactions found",
  "id": "Transaction ID",
  "date": "Date",
  "customer": "Customer",
  "game": "Game",
  "amount": "Amount",
  "status": "Status",
  "gateway": "Gateway",
  "invoice": "Invoice",
  "filterAll": "All Status",
  "filterCompleted": "Completed",
  "filterPending": "Pending",
  "filterFailed": "Failed",
  "statusCompleted": "Completed",
  "statusPending": "Pending",
  "statusFailed": "Failed"
}
```

And add tab:
```json
"tabs": {
  "games": "Games",
  "news": "News",
  "analytics": "Analytics",
  "transactions": "Transactions"
}
```

**File: `src/locales/id.json`** - Indonesian translations:

```json
"transactions": {
  "title": "Riwayat Transaksi",
  "loading": "Memuat transaksi...",
  "noTransactions": "Tidak ada transaksi ditemukan",
  "id": "ID Transaksi",
  "date": "Tanggal",
  "customer": "Pelanggan",
  "game": "Game",
  "amount": "Jumlah",
  "status": "Status",
  "gateway": "Gateway",
  "invoice": "Invoice",
  "filterAll": "Semua Status",
  "filterCompleted": "Selesai",
  "filterPending": "Menunggu",
  "filterFailed": "Gagal",
  "statusCompleted": "Selesai",
  "statusPending": "Menunggu",
  "statusFailed": "Gagal"
}
```

And add tab:
```json
"tabs": {
  "games": "Game",
  "news": "Berita",
  "analytics": "Analitik",
  "transactions": "Transaksi"
}
```

---

### Part 6: Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/admin/TransactionHistory.tsx` | Create | New component for transaction table |
| `src/pages/Admin.tsx` | Update | Add 4th tab for transactions |
| `src/locales/en.json` | Update | Add transaction translation keys |
| `src/locales/id.json` | Update | Add Indonesian translations |

---

### Technical Details

**Transaction Interface:**
```typescript
interface Transaction {
  id: string;
  user_id: string;
  game_id: string;
  purchase_date: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_gateway: string;
  gateway_order_id: string | null;
  games: { title: string } | null;
  customer_email?: string;
}
```

**Status Badge Colors:**
- `completed`: `bg-green-500/20 text-green-400`
- `pending`: `bg-yellow-500/20 text-yellow-400`
- `failed`: `bg-red-500/20 text-red-400`

**Pagination:**
- 10 items per page
- Uses existing Pagination components from `@/components/ui/pagination`

