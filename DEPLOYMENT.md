# Aspire OS — Deployment Guide

## Step 1: Google Sheets Setup

1. Go to [Google Sheets](https://sheets.google.com) → Create new spreadsheet
2. Name it **"Aspire OS Database"**
3. Create these 9 sheets (tabs at the bottom) with **exact names**:

| Sheet | First Row Headers (copy-paste exactly) |
|---|---|
| **Users** | `id  name  email  password  role  avatar  createdAt` |
| **Projects** | `id  name  clientId  clientName  status  startDate  dueDate  description  createdAt  updatedAt` |
| **Tasks** | `id  projectId  projectName  title  description  assigneeId  assigneeName  status  priority  dueDate  createdAt  updatedAt` |
| **Clients** | `id  name  email  phone  company  paymentStatus  createdAt  updatedAt` |
| **TimeLogs** | `id  taskId  projectId  userId  userName  startTime  endTime  duration  notes  createdAt` |
| **Comments** | `id  taskId  userId  userName  text  createdAt` |
| **Leads** | `id  name  company  email  phone  source  status  value  notes  assigneeId  assigneeName  createdAt  updatedAt` |
| **CalendarEvents** | `id  title  type  description  date  time  platform  assigneeId  assigneeName  projectId  projectName  clientId  clientName  createdAt  updatedAt` |
| **Approvals** | `id  taskId  approverId  approverName  status  remark  createdAt  updatedAt` |

4. Add your first user to the **Users** sheet:
   ```
   user1  Your Name  you@yourcompany.com  yourpassword  admin  (blank)  2024-01-01T00:00:00Z
   ```
   > ⚠️ The `id` column must be **unique per user**. You can use any string like `user1`, `user2`, etc.

---

## Step 2: Deploy Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete the default code in `Code.gs`
3. Copy the entire contents of `apps-script/Code.gs` and paste it
4. Click **Save** (💾)
5. Click **Deploy → New Deployment**
6. Set:
   - **Type**: Web App
   - **Execute as**: Me
   - **Who has access**: Anyone
7. Click **Deploy** → Authorize when prompted
8. **Copy** the Web App URL (looks like `https://script.google.com/macros/s/XXXXXXXXXX/exec`)

> 💡 **Tip**: Every time you update `Code.gs`, you must create a **New Deployment** (not update existing) for changes to take effect.

---

## Step 3: Configure Environment Variables

1. In your `aspire-os` folder, open `.env.local`
2. Set the URL you just copied:
   ```env
   NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
3. Save the file and restart the dev server:
   ```bash
   npm run dev
   ```

---

## Step 4: Deploy to Vercel

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel --cwd d:/DIGISPIRE/Task_Management/aspire-os
```
Follow the prompts. When done, add the env variable in Vercel dashboard.

### Option B: GitHub → Vercel (Recommended)
1. Push the `aspire-os` folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. In **Environment Variables** section, add:
   ```
   NEXT_PUBLIC_APPS_SCRIPT_URL = https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
4. Click **Deploy**

Your app will be live at `https://aspire-os.vercel.app` (or similar).

---

## Step 5: Local Development

```bash
cd d:/DIGISPIRE/Task_Management/aspire-os
npm run dev
```
→ Open [http://localhost:3000](http://localhost:3000)

> Without `NEXT_PUBLIC_APPS_SCRIPT_URL` set, the app runs with **mock/demo data** so you can develop without a backend.

**Mock login credentials:**
- Email: `arjun@aspire.digital`
- Password: anything

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Login fails in production | Verify email exists in Users sheet, password matches |
| Empty data after deploy | Check Apps Script URL is correct and deployed as Web App |
| CORS errors | Re-deploy Apps Script with **"Anyone"** access setting |
| Task updates not persisting | Create a **New Deployment** in Apps Script after any code changes |
| Charts not showing | Ensure `react-chartjs-2` is installed: `npm install chart.js react-chartjs-2` |

---

## File Reference

```
aspire-os/
├── app/
│   ├── login/page.tsx          ← Login page
│   ├── dashboard/
│   │   ├── layout.tsx          ← Auth-protected shell
│   │   ├── page.tsx            ← Dashboard with charts
│   │   ├── projects/page.tsx   ← Project management
│   │   ├── tasks/page.tsx      ← Tasks (Kanban + List)
│   │   ├── clients/page.tsx    ← Client management
│   │   ├── team/page.tsx       ← Team directory
│   │   └── time/page.tsx       ← Time tracker
├── components/
│   ├── layout/                 ← Sidebar, Topbar
│   ├── tasks/                  ← KanbanBoard, TaskDetailsPanel
│   └── shared/                 ← Badge, Avatar, Skeleton, StatCard
├── lib/
│   ├── api.ts                  ← All API calls + mock data
│   ├── types.ts                ← TypeScript interfaces
│   └── utils.ts                ← Helpers + color maps
├── context/AuthContext.tsx      ← Auth state + localStorage session
├── apps-script/Code.gs         ← Google Apps Script backend
└── .env.local                  ← Environment variables
```
