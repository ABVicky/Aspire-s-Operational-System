# 🚀 Aspire OS — Final Backend Setup Guide

Follow these steps to connect your **Aspire OS** frontend to the **Google Sheets** database and **Google Drive** storage.

---

### Phase 1: Google Sheets Configuration
1.  **Create a New Spreadsheet**: Go to [sheets.new](https://sheets.new) and name it **Aspire OS Database**.
2.  **Create Tabs**: Create exactly **9 tabs** with the following names (case-sensitive):
    *   `Users`
    *   `Projects`
    *   `Tasks`
    *   `Clients`
    *   `TimeLogs`
    *   `Comments`
    *   `Leads`
    *   `CalendarEvents`
    *   `Approvals`
3.  **Add Table Headers**: In the **first row** (Row 1) of each sheet, paste the following headers exactly:

| Sheet Name | Row 1 Headers (A1, B1, C1...) |
| :--- | :--- |
| **Users** | `id`, `name`, `email`, `password`, `role`, `phone`, `department`, `avatar`, `createdAt` |
| **Projects** | `id`, `name`, `clientId`, `clientName`, `status`, `startDate`, `dueDate`, `description`, `createdAt`, `updatedAt` |
| **Tasks** | `id`, `projectId`, `projectName`, `title`, `description`, `assigneeId`, `assigneeName`, `status`, `priority`, `dueDate`, `createdAt`, `updatedAt` |
| **Clients** | `id`, `name`, `email`, `phone`, `company`, `paymentStatus`, `createdAt`, `updatedAt` |
| **TimeLogs** | `id`, `taskId`, `projectId`, `userId`, `userName`, `startTime`, `endTime`, `duration`, `notes`, `createdAt` |
| **Comments** | `id`, `taskId`, `userId`, `userName`, `text`, `createdAt` |
| **Leads** | `id`, `name`, `company`, `email`, `phone`, `source`, `status`, `value`, `notes`, `assigneeId`, `assigneeName`, `createdAt`, `updatedAt` |
| **CalendarEvents** | `id`, `title`, `type`, `description`, `date`, `time`, `platform`, `assigneeId`, `assigneeName`, `projectId`, `projectName`, `clientId`, `clientName`, `createdAt`, `updatedAt` |
| **Approvals** | `id`, `taskId`, `approverId`, `approverName`, `status`, `remark`, `createdAt`, `updatedAt` |

4.  **Add Admin Account**: In the `Users` sheet, add the following to Row 2:
    *   **id**: `u_1`
    *   **name**: `Your Name`
    *   **email**: `admin@aspire.os`
    *   **password**: `admin123`
    *   **role**: `admin`
    *   **department**: `Creative`
    *   **(rest blank/createdAt)**: `2024-03-24`

---

### Phase 2: Apps Script Deployment
1.  In your Google Sheet, go to **Extensions** → **Apps Script**.
2.  Rename the project to `Aspire OS Backend`.
3.  **Copy the code** from your local `apps-script/Code.gs` file and paste it into the script editor.
4.  **Save** (Ctrl+S).
5.  **Click Deploy** → **New Deployment**.
    *   **Select type**: Web App
    *   **Description**: `v1.0 - Digital identity & Drive support`
    *   **Execute as**: Me
    *   **Who has access**: **Anyone** (This is required for the frontend to connect)
6.  **Authorize**: Click **Deploy**, then **Authorize Access**. Choose your account and click **Advanced** → **Go to Aspire OS (unsafe)** → **Allow**.
7.  **Copy Web App URL**: Copy the URL ending in `/exec`.

---

### Phase 3: Frontend Configuration
1.  Open your local `.env.local` file.
2.  Update the URL:
    ```bash
    NEXT_PUBLIC_APPS_SCRIPT_URL=COPIED_WEB_APP_URL_HERE
    ```
3.  **Enable Production Mode**: Open `lib/api.ts` and set `USE_MOCK` to `false`:
    ```typescript
    // lib/api.ts
    const USE_MOCK = false; 
    ```
4.  **Restart the Project**:
    ```bash
    npm run dev
    ```

---

### ✅ Success Checklist:
*   [ ] Can you login with `admin@aspire.os`?
*   [ ] Does clicking the Avatar trigger an upload to Google Drive? (Check your Drive for an `Aspire_Avatars` folder)
*   [ ] Do updates to your phone/email reflect in the Google Sheet instantly?
*   [ ] Is your Identity Card showing your official **Employee ID**?

**Need help?** Re-check the permission step (Phase 2, Step 5) is set to **"Anyone"**.
