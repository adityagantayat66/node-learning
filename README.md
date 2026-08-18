# Full-Stack Angular & NestJS Application with Docker, Nginx & Versioned Frontend Rollbacks

An end-to-end full-stack demonstration featuring an ****Angular**** frontend, ****NestJS**** REST API backend, ****PostgreSQL**** database, and an ****Nginx**** reverse proxy—fully containerized with ****Docker Compose**** and equipped with a zero-downtime, scriptable build deployment & instant rollback mechanism.

---

**## 🏗️ Architecture Overview**

The application is split into independently containerized runtime services and a separate frontend build service, all orchestrated with Docker Compose. Nginx serves the Angular files from a host-mounted directory and reverse-proxies `/api` requests to NestJS:

```mermaid
flowchart TD
    Client["Browser / Client"] -->|HTTP :8080| Nginx["Nginx Reverse Proxy"]

    subgraph Runtime["Docker Compose Runtime"]
        Nginx -->|"/api/*"| Nest["NestJS API :3000"]
        Nest -->|"SQL / TypeORM"| Postgres[("PostgreSQL :5432")]
        Nginx -->|"Static Angular files"| Latest["shared-build-version/latest-version"]
    end

    subgraph Deploy["Frontend Deployment - npm run deploy"]
        DeployScript["deploy-frontend.ps1"]
        NewBuild["shared-build-version/new-build"]
        Stable["shared-build-version/last-stable-version"]

        DeployScript -->|"1. Build"| NewBuild
        DeployScript -->|"2. Backup current release"| Stable
        DeployScript -->|"3. Promote new release"| Latest
        NewBuild -->|"Promote"| Latest
    end

    subgraph Rollback["Frontend Rollback - npm run rollback"]
        RollbackScript["rollback-frontend.ps1"]
        RollbackScript -->|"Restore"| Stable
        Stable -->|"Copy over active release"| Latest
    end
```

**### Key Components**

1. ****Frontend (`/frontend/node-app`)****: Single Page Application built with Angular 18 and Angular Material, organized modularly with `auth` and `dashboard` feature modules.

2. ****Backend (`/nest-server`)****: Modular REST API built with NestJS, TypeORM, and JWT Authentication.

3. ****Database (`postgres`)****: PostgreSQL database instance for persistent user and application state.

4. ****Reverse Proxy (`/nginx`)****: Nginx reverse proxy serving compiled Angular static assets from a shared host volume and forwarding `/api` traffic to the NestJS backend container (`http://nestapi:3000`).

5. ****Shared Build Directory (`/shared-build-version`)****: Contains versioned builds (`new-build`, `latest-version`, `last-stable-version`) providing a simple release-promotion and rollback mechanism without changing the Nginx volume mapping.

---

**## 📁 Repository Structure**

```

node-app/

├── compose.yml                  # Main Docker Compose configuration (3 runtime services + 1 build profile)

├── deploy-frontend.ps1          # PowerShell deployment script managing build promotion & backups

├── rollback-frontend.ps1        # PowerShell rollback script restoring previous stable release

├── README.md                    # Project documentation

├── shared-build-version/        # Shared host volume mounted to Nginx container

│   ├── latest-version/          # Currently live production build mounted to /usr/share/nginx/html

│   ├── last-stable-version/     # Immediate rollback backup of previous release

│   └── new-build/               # Temporary workspace for freshly compiled frontend assets

├── nginx/                       # Nginx reverse proxy configuration & Dockerfile

│   ├── dockerfile

│   └── nginx.conf

├── nest-server/                 # NestJS Backend Application

│   ├── src/

│   │   ├── auth/                # JWT Auth logic & controllers

│   │   ├── dashboard/           # Admin & User dashboard endpoints

│   │   ├── users/               # TypeORM User entity & Users service

│   │   └── common/              # Role guards, decorators, & types

│   └── dockerfile

└── frontend/

    └── node-app/                # Angular Frontend Application

        ├── src/app/

        │   ├── auth/            # Auth module (Login & Register components, Auth service)

        │   │   ├── login/

        │   │   ├── register/

        │   │   └── auth.service.ts

        │   ├── dashboard/       # Dashboard module (Component & Service)

        │   ├── shared/          # Shared components & UI modules

        │   └── utils/           # Route resolvers & guards

        └── package.json         # Scripts: `npm run deploy` & `npm run rollback`

```

---

**## 🚀 Quick Start Guide**

**### Prerequisites**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose V2)

- [Node.js](https://nodejs.org/) (v18+ recommended)

- PowerShell (Windows / PowerShell Core on Linux/macOS)

---

**### Step 1: Initial Deployment & Startup**

1. ****Clone the Repository****:

   ```bash

   git clone \<repository-url>

   cd node-app

   ```

2. ****Build and Deploy the Angular Frontend****:

   Run the deployment command to compile and populate `./shared-build-version/latest-version`:

   ```powershell

   *# Option A: From root directory*

   powershell -ExecutionPolicy Bypass -File ./deploy-frontend.ps1

   *# Option B: From frontend directory*

   cd frontend/node-app

   npm run deploy

   ```

3. ****Spin Up Microservices with Docker Compose****:

   ```bash

   docker compose up -d --build

   ```

   This command starts the 3 core runtime containers:

   - `postgrescont`: PostgreSQL Database (`localhost:5432`)

   - `nestapi`: NestJS API Backend (`localhost:3000`)

   - `nginxcont`: Nginx Web Server (`localhost:8080`)

4. ****Access the Application****:

   Open your browser and navigate to:

   ```

   http://localhost:8080

   ```

---

**## 🔄 Automated Frontend Deployment & Rollback Workflow**

**### 🚀 Deploying New Frontend Versions (`npm run deploy`)**

Whenever you make frontend code changes in `frontend/node-app/`, deploy them to production by running:

```bash

cd frontend/node-app

npm run deploy

```

**#### What happens during deployment (`deploy-frontend.ps1`):**

1. ****Clean Workspace****: Wipes `./shared-build-version/new-build/`.

2. ****Containerized Build****: Executes `docker compose --profile build run --build --rm frontend` to compile Angular assets into `./shared-build-version/new-build/`.

3. ****Automated Backup****: Copies current active build from `latest-version/` into `last-stable-version/`.

4. ****Live Promotion****: Promotes compiled files from `new-build/` into `latest-version/`.

5. ****Zero Downtime****: Nginx automatically serves the updated static assets immediately without restarting containers!

---

**### ⏪ Automated Instant Rollback (`npm run rollback`)**

If a newly deployed version introduces bugs or unexpected issues, perform an instant rollback to the previous stable build using the automated rollback command:

```bash

*# Executed from frontend directory*

cd frontend/node-app

npm run rollback

```

**(Or from root directory: `powershell -ExecutionPolicy Bypass -File ./rollback-frontend.ps1`)**

**#### What happens during rollback (`rollback-frontend.ps1`):**

1. ****Verification****: Validates that `./shared-build-version/last-stable-version` exists.

2. ****Clean Active Build****: Clears `./shared-build-version/latest-version/`.

3. ****Restore Backup****: Copies files from `./shared-build-version/last-stable-version/` into `./shared-build-version/latest-version/`.

4. ****Instant Effect****: Nginx immediately serves the restored stable version with zero container downtime!

---

**### 🔀 Alternative Manual Rollback via Volume Mapping**

If required, you can also roll back manually by modifying the `nginx` volume mapping in `compose.yml`:

```yaml

*# Change from:*

**volumes**:

  - ./shared-build-version/latest-version:/usr/share/nginx/html

*# To:*

**volumes**:

  - ./shared-build-version/last-stable-version:/usr/share/nginx/html

```

Then reload Nginx:

```bash

docker compose up -d nginx

```

---

**## 🧪 Testing & Feature Showcase**

**### 1. User Registration (Sign Up)**

- Go to `http://localhost:8080/signup`.

- Register a new user with Full Name, Email, Age, and Password.

- Newly registered accounts default to the `user` role.

**### 2. User Dashboard Experience**

- Sign in with a standard `user` account at `http://localhost:8080/login`.

- View profile information (Name, Email, Age, Role).

- Standard users are restricted from accessing administrative features or company details.

**### 3. Admin Credentials & Privileges**

- Admin account details can be found/configured in `nest-server/.env-prod`:

- Log in with the Admin account to access the ****Admin Dashboard****.

**### 4. Admin Management Capabilities**

- ****View All Users****: Renders table of all registered system users with their emails, ages, and current roles.

- ****Dynamic Role Management (`++Admin` / `--User`)****:

  - Click the ****`++Admin`**** button to upgrade a standard user to Admin.

  - Click the ****`--User`**** button to demote an Admin back to a regular User.

  - Role changes instantly persist in PostgreSQL via the backend update endpoint.

- ****User Deletion****:

  - Click the ****Delete**** button next to any user record to remove them from the system database.

**### 5. Nginx Reverse Proxy Routing (`/api`)**

All frontend HTTP services target the Nginx reverse proxy endpoint (`http://localhost:8080/api/...`):

- Nginx routes `/api/*` traffic directly to the NestJS backend container (`nestapi:3000`).

---

**## 🛠️ API Endpoints Summary**

\| Method | Endpoint | Access | Description |

\| :--- | :--- | :--- | :--- |

\| `POST` | `/api/auth/signUp` | Public | Registers a new standard user |

\| `POST` | `/api/auth/signIn` | Public | Authenticates user & returns JWT token |

\| `GET` | `/api/dashboard/getUserDetails` | Authenticated | Fetches single profile or all profiles (Admin) |

\| `GET` | `/api/dashboard/companyInfo` | Admin Only | Fetches company information |

\| `PATCH` | `/api/dashboard/updateRole` | Admin Only | Updates target user role (`user` <-> `admin`) |

\| `DELETE`| `/api/dashboard/delete/:id` | Admin Only | Deletes a user record by UUID |

---

**## 🧰 Local Development Setup (Without Docker)**

If you wish to run the backend and frontend locally for development:

1. ****Start NestJS Server****:

   ```bash

   cd nest-server

   npm install

   npm run start:dev

   ```

2. ****Start Angular Application****:

   ```bash

   cd frontend/node-app

   npm install

   npm start

   ```

   The frontend dev server will run at `http://localhost:4200`.
