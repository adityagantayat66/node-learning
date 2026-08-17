# Full-Stack Angular & NestJS Microservices Application with Docker & Nginx Versioned Rollback Pipeline

An end-to-end full-stack demonstration featuring an **Angular** frontend, **NestJS** REST API backend, **PostgreSQL** database, and an **Nginx** reverse proxy—fully containerized with **Docker Compose** and equipped with a zero-downtime, scriptable build deployment & instant rollback mechanism.

---

## 🏗️ Architecture Overview

The system architecture is structured into microservices managed via Docker Compose and Nginx volume sharing:

```mermaid
graph TD
    Client[Browser / Client] -->|Port 8080| Nginx[Nginx Reverse Proxy]
    
    subgraph Containerized Stack (docker compose up)
        Nginx -->|/api/* requests| Nest[NestJS API Server :3000]
        Nest -->|Database Queries| Postgres[(PostgreSQL DB :5432)]
        Nginx -->|Static Frontend Assets| SharedVol[Volume: ./shared-build-version/latest-version]
    
    end

    subgraph Build & Versioning Pipeline (npm run deploy)
        DeployScript[deploy-frontend.ps1] -->|1. Build Angular Container| NewBuild[./shared-build-version/new-build]
        DeployScript -->|2. Backup Previous Version| LastStable[./shared-build-version/last-stable-version]
        DeployScript -->|3. Promote Build| SharedVol
    end
```

### Key Components

1. **Frontend (`/frontend/node-app`)**: Single Page Application built with Angular 18 and Angular Material.
2. **Backend (`/nest-server`)**: Modular REST API built with NestJS, TypeORM, and JWT Authentication.
3. **Database (`postgres`)**: PostgreSQL database instance for persistent user and application state.
4. **Reverse Proxy (`/nginx`)**: Nginx reverse proxy serving compiled Angular static assets from a shared host volume and forwarding `/api` traffic to the NestJS backend container (`http://nestapi:3000`).
5. **Shared Build Directory (`/shared-build-version`)**: Contains versioned builds (`new-build`, `latest-version`, `last-stable-version`) enabling instant blue/green-style deployments and seamless rollbacks without rebuilding images.

---

## 📁 Repository Structure

```
node-app/
├── compose.yml                  # Main Docker Compose configuration (3 runtime services + 1 build profile)
├── deploy-frontend.ps1          # PowerShell deployment script managing build promotion & backups
├── README.md                    # Project documentation
├── shared-build-version/        # Shared host volume mounted to Nginx container
│   ├── latest-version/          # Currently live production build mounted to /usr/share/nginx/html
│   ├── last-stable-version/     # Immediate rollback backup of previous release
│   └── new-build/               # Temporary workspace for freshly compiled frontend assets
├── nginx/                       # Nginx reverse proxy configuration & Dockerfile
│   ├── dockerfile
│   └── nginx.conf
├── nest-server/                 # NestJS Backend Application
│   ├── src/
│   │   ├── auth/                # JWT Auth logic & controllers
│   │   ├── dashboard/           # Admin & User dashboard endpoints
│   │   ├── users/               # TypeORM User entity & Users service
│   │   └── common/              # Role guards, decorators, & types
│   └── dockerfile
└── frontend/
    └── node-app/                # Angular Frontend Application
        ├── src/app/             # Components (Login, SignUp, Dashboard, Guards, Services)
        └── package.json         # Contains `npm run deploy` task
```

---

## 🚀 Quick Start Guide

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose V2)
- [Node.js](https://nodejs.org/) (v18+ recommended)
- PowerShell (Windows / PowerShell Core on Linux/macOS)

---

### Step 1: Initial Deployment & Startup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd node-app
   ```

2. **Build and Deploy the Angular Frontend**:
   Run the initial deployment command to populate `./shared-build-version/latest-version`:
   ```powershell
   # Option A: From root directory
   powershell -ExecutionPolicy Bypass -File ./deploy-frontend.ps1

   # Option B: From frontend directory
   cd frontend/node-app
   npm run deploy
   ```

3. **Spin Up Microservices with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```
   This command starts the 3 core runtime containers:
   - `postgrescont`: PostgreSQL Database (`localhost:5432`)
   - `nestapi`: NestJS API Backend (`localhost:3000`)
   - `nginxcont`: Nginx Web Server (`localhost:8080`)

4. **Access the Application**:
   Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

## 🔄 Automated Frontend Deployment & Rollback Workflow

### 🚀 Deploying New Frontend Versions (`npm run deploy`)

Whenever you make frontend code changes in `frontend/node-app/`, deploy them to production by executing:

```bash
cd frontend/node-app
npm run deploy
```

#### What happens during deployment (`deploy-frontend.ps1`):
1. **Clean Workspace**: Wipes `./shared-build-version/new-build/`.
2. **Containerized Build**: Executes `docker compose --profile build run --build --rm frontend` to build production Angular assets into `./shared-build-version/new-build/`.
3. **Automated Backup**: Copies current active build from `latest-version/` into `last-stable-version/`.
4. **Live Promotion**: Promotes files from `new-build/` into `latest-version/`.
5. **Zero Downtime**: Nginx automatically serves the updated static assets immediately without restarting containers!

---

### ⏪ Simple & Instant Rollback Strategy

If a newly deployed version introduces issues or bugs, you can roll back instantly using either of two methods:

#### Method 1: Host Directory Swap (Instant Zero-Downtime Rollback)
Copy the backed-up files from `last-stable-version/` back into `latest-version/`:

```powershell
Remove-Item "./shared-build-version/latest-version/*" -Recurse -Force
Copy-Item "./shared-build-version/last-stable-version/*" "./shared-build-version/latest-version/" -Recurse -Force
```

#### Method 2: Volume Mapping Change in `compose.yml`
Update the `nginx` service volume mapping in `compose.yml`:

```yaml
# Before (Latest Version):
volumes:
  - ./shared-build-version/latest-version:/usr/share/nginx/html

# After (Rollback to Previous Stable Version):
volumes:
  - ./shared-build-version/last-stable-version:/usr/share/nginx/html
```

Then reload Nginx:
```bash
docker compose up -d nginx
```

---

## 🧪 Testing & Feature Showcase

### 1. User Registration (Sign Up)
- Go to `http://localhost:8080/signup`.
- Register a new user with Full Name, Email, Age, and Password.
- Newly registered accounts default to the `user` role.

### 2. User Dashboard Experience
- Sign in with a standard `user` account at `http://localhost:8080/login`.
- View profile information (Name, Email, Age, Role).
- Standard users are restricted from accessing administrative features or company details.

### 3. Admin Credentials & Privileges
- Admin account details can be found/configured in `nest-server/.env-prod`:
  - **Admin Email**: `admin@gmail.com` (or any email containing `admin`)
  - **Admin Password**: `admin123`
- Log in with the Admin account to access the **Admin Dashboard**.

### 4. Admin Management Capabilities
- **View All Users**: Renders table of all registered system users with their emails, ages, and current roles.
- **Dynamic Role Management (`++Admin` / `--User`)**:
  - Click the **`++Admin`** button to upgrade a standard user to Admin.
  - Click the **`--User`** button to demote an Admin back to a regular User.
  - Role changes instantly persist in PostgreSQL via the backend update endpoint.
- **User Deletion**:
  - Click the **Delete** button next to any user record to remove them from the system database.

### 5. Reverse Proxy Verification (`/api`)
Nginx forwards API traffic seamlessly:
- Accessing `http://localhost:8080/api/dashboard/getUserDetails` routes through Nginx to NestJS backend (`http://nestapi:3000/api/dashboard/getUserDetails`).

---

## 🛠️ API Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signUp` | Public | Registers a new standard user |
| `POST` | `/api/auth/signIn` | Public | Authenticates user & returns JWT token |
| `GET` | `/api/dashboard/getUserDetails` | Authenticated | Fetches single profile or all profiles (Admin) |
| `GET` | `/api/dashboard/companyInfo` | Admin Only | Fetches company information |
| `PATCH` | `/api/dashboard/updateRole` | Admin Only | Updates target user role (`user` <-> `admin`) |
| `DELETE`| `/api/dashboard/delete/:id` | Admin Only | Deletes a user record by UUID |

---

## 🧰 Local Development Setup (Without Docker)

If you wish to run the backend and frontend locally for development:

1. **Start NestJS Server**:
   ```bash
   cd nest-server
   npm install
   npm run start:dev
   ```

2. **Start Angular Application**:
   ```bash
   cd frontend/node-app
   npm install
   npm start
   ```
   The frontend will run at `http://localhost:4200` connected to `http://localhost:3000`.
