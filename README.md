# BockNexusServer

Server-side application for the BockNexus ecosystem, built with Node.js, Express, and Prisma.

##  Features
- RESTful API endpoints using Express.js
- Database integration with Prisma
- Database seeding utilities (`seedData.js`, `seedScript.js`)
- Organized controllers and routes for modular code structure

##  Requirements
- Node.js (v14 or later)
- npm (v6+) or Yarn
- A supported database (e.g., PostgreSQL preferred as it is what this was originally built on) configured via Prisma

##  Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BOCK-CHAIN/BockNexusServer.git
   cd BockNexusServer

2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Create environment variables**
   
    Create a .env in the root of the folder and add the database connection there (in this case we used neon.tech)
    Also, the payment keys which were not included in this part of the app.

    ```sh
    DATABASE_URL = "[Your_connection_URL_here]"
    ```
5. **Migrate and seed the database**
   Do this to generate the prisma code located in the database (neon.tech server)
   ```sh
   npx prisma generate
   ```
6. **Start the server**
   ```sh
   npm start
   ```
