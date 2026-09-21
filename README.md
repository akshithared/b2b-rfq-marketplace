# Mini B2B RFQ Marketplace

A full-stack, role-based B2B Request for Quotation (RFQ) marketplace application designed to streamline digital procurement workflows between Buyers and Suppliers. This platform provides secure authentication, dedicated role-based workspaces, real-time RFQ lifecycle management, and a robust competitive bidding system.

---

## 🌟 Key Features & Workflow

### 1. Secure Authentication & Role-Based Access Control
- **Dual-Role Architecture:** Clean separation of workspaces for **Buyers** and **Suppliers** right from registration and login.
- **Token-Based Security:** Secure session handling using modern authorization tokens and Axios interceptors to protect API routes.

### 2. Buyer Capabilities (Procurement Management)
- **RFQ Creation:** Post custom Requests for Quotations detailing product/service names, comprehensive descriptions, required quantities, delivery locations, and strict deadlines.
- **RFQ Lifecycle Control:** Full CRUD operations allowing buyers to manage, edit, update, or delete active procurement requests.
- **Bid Evaluation Hub:** View, review, and compare competitive price quotations and notes submitted by various suppliers for specific RFQs.

### 3. Supplier Capabilities (Bidding & Marketplace)
- **Marketplace Discovery:** Browse all available open RFQ opportunities posted across the platform.
- **Search & Filtering:** Quickly locate relevant procurement requests using built-in keyword filters.
- **Quotation Submission:** Prepare and submit professional competitive bids including unit pricing, estimated delivery timelines (in days), and custom business notes/terms.
- **Session State Persistence:** Robust client-side and backend synchronization ensuring submitted quotations and data persist reliably across browser refreshes.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React.js, Vite, Axios, React Hooks (`useState`, `useEffect`, `useCallback`), Modern Responsive CSS Grid System.
- **Backend:** Node.js, Express.js implementing a structured RESTful API architecture.
- **Database & Persistence:** Persistent backend storage integrated with smart local caching.
- **Version Control & Deployment:** Git, GitHub, and production-ready architecture.

---

## 📂 Project Repository

You can view the complete source code, commit history, and pull requests on GitHub:
👉 [GitHub Repository: akshithared/b2b-rfq-marketplace](https://github.com/akshithared/b2b-rfq-marketplace)

---

## 🚀 Getting Started Locally

Follow these steps to set up and run the project locally on your machine.

### Prerequisites
Make sure you have **Node.js** and **npm** installed on your system.

### 1. Clone the Repository
```bash
git clone [https://github.com/akshithared/b2b-rfq-marketplace.git](https://github.com/akshithared/b2b-rfq-marketplace.git)
cd b2b-rfq-marketplace