Let’s add nodemon to your packages/backend setup to automatically restart the server whenever files change during development. This will enhance your workflow by eliminating the need to manually restart the server after every code update. Since you’re using pnpm and ts-node, I’ll integrate nodemon to work seamlessly with them.
Step 1: Install nodemon
Add nodemon as a Dev Dependency:
bash

cd packages/backend
pnpm add -D nodemon

Verify package.json:
After installation, your packages/backend/package.json should include nodemon in devDependencies:
json

{
  "name": "@expense-tracker/backend",
  "version": "0.0.1",
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@expense-tracker/common": "workspace:*",
    "express": "^4.18.2",
    "@prisma/client": "^5.0.0",
    "zod": "^3.22.4",
    "express-rate-limit": "^6.7.0",
    "bcrypt": "^5.1.0",
    "express-oauth2-jwt-bearer": "^1.6.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "supertest": "^6.0.0",
    "@types/supertest": "^2.0.0",
    "@types/express": "^4.17.0",
    "@types/bcrypt": "^5.0.0",
    "@types/express-oauth2-jwt-bearer": "^1.0.0",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1" // Added here
  }
}

Step 2: Configure nodemon
Update Scripts in package.json:
Replace the start script with a dev script that uses nodemon with ts-node, and add a production-ready start script:
json

"scripts": {
  "start": "node dist/index.js",
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "test": "jest",
  "lint": "eslint . --ext .ts",
  "format": "prettier --write ."
}

Create a nodemon.json File (Optional)**:
For more control, add packages/backend/nodemon.json to specify which files to watch and ignore:
json

{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts", "dist"],
  "exec": "ts-node src/index.ts"
}

watch: Monitors changes in the src directory.

ext: Watches only .ts files.

ignore: Excludes test files and the dist folder.

exec: Runs ts-node on src/index.ts.

If you create this file, nodemon will use it automatically when you run pnpm dev.

Step 3: Test the Setup
Run the Development Server:
bash

cd packages/backend
pnpm dev

You should see output like:

[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/**/*
[nodemon] watching extensions: ts
[nodemon] starting `ts-node src/index.ts`
Server running on port 3000

Make a Change:
Edit src/index.ts (e.g., change the log message to "Server started on port ${PORT}"), save the file, and confirm that nodemon restarts the server automatically:

[nodemon] restarting due to changes...
[nodemon] starting `ts-node src/index.ts`
Server started on port 3000

Step 4: Additional Configuration (Optional)
TypeScript Support:
nodemon works with ts-node out of the box, but if you encounter issues (e.g., with TypeScript paths), ensure your tsconfig.json in packages/backend is correctly set up:
json

{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@expense-tracker/common": ["../common/dist/index"],
      "@expense-tracker/common/*": ["../common/dist/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"]
}

Production Workflow:
The start script now runs the compiled JavaScript, so for production:
bash

pnpm build
pnpm start

Step 5: Update GitHub Actions (if needed)
If your CI workflow runs the start script, update .github/workflows/ci.yml to install nodemon for development testing or adjust it to use the build and start scripts:
yaml

- run: pnpm build
- run: pnpm start & # Run in background for testing

Final Validation
Run pnpm dev and verify the server restarts on file changes.

Test an endpoint (e.g., POST /api/monthly-expenses) with a valid Auth0 token.

Run pnpm build and pnpm start to confirm the production setup works.

With nodemon added, your development experience should be much smoother. Let me know if you run into any issues or want further tweaks!

where should i deploy my backend app that is free?

7 posts

15 web pages

There are several free options for deploying your backend app, depending on your specific needs (e.g., language, scalability, database integration). Since your app is built with Express.js, Prisma, and Node.js (based on our prior work), here are some of the best free deployment platforms that can handle this stack as of March 16, 2025:
1. Render
Why It’s Great: Render offers a free tier for web services that’s perfect for Node.js backends like yours. It includes automatic scaling, free SSL, and a simple deployment process via Git.

Free Tier Limits:
750 free hours/month (enough to run continuously with one instance).

100 MB of outbound bandwidth/month.

Apps sleep after 15 minutes of inactivity (wakes up on request).

How to Deploy:
Push your code to a GitHub repository.

Sign up at render.com, connect your GitHub repo, and create a new Web Service.

Select the free tier, set the runtime to Node.js, and specify npm install && npm run build && npm start as the start command (adjust based on your package.json).

Best For: Simple Node.js backends with moderate traffic.

2. Fly.io
Why It’s Great: Fly.io provides a free tier for running containerized apps globally with low latency, ideal for Express.js apps. It supports Docker, which you can use to package your app.

Free Tier Limits:
3 shared CPU instances (256 MB RAM each), running 24/7.

3 GB persistent storage.

160 GB/month bandwidth.

How to Deploy:
Install the flyctl CLI: curl -L https://fly.io/install.sh | sh.

Sign up at fly.io, then run flyctl auth signup.

Create a Dockerfile in your project root:
dockerfile

FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

Run flyctl launch, follow the prompts, and deploy with flyctl deploy.

Best For: Apps needing persistent uptime and global deployment.

3. Vercel
Why It’s Great: While Vercel is known for frontend hosting, it supports serverless Node.js backends via its Functions feature, making it viable for your Express app.

Free Tier Limits:
100 GB-hours/month of function execution.

100 GB bandwidth/month.

Serverless (no persistent state, sleeps when idle).

How to Deploy:
Push your code to GitHub.

Sign up at vercel.com, import your repo, and configure it as a Node.js project.

Move your Express app to an api/ folder (e.g., api/index.ts), and Vercel will treat it as a serverless function.

Deploy with vercel --prod.

Best For: Lightweight, stateless APIs (note: Prisma might need a separate database like Supabase or PlanetScale).

4. Back4App (Containers)
Why It’s Great: Back4App offers a free container-based tier for Node.js backends, with support for databases like PostgreSQL (via Prisma).

Free Tier Limits:
0.25 shared CPU.

100 GB data transfer/month.

256 MB RAM.

How to Deploy:
Sign up at back4app.com.

Create a new app, select Containers, and choose the free tier.

Connect your GitHub repo and configure your Dockerfile (similar to Fly.io’s example).

Deploy via the dashboard.

Best For: Backend apps needing database integration.

Recommendation
For Simplicity: Use Render. It’s straightforward, supports Node.js natively, and requires minimal configuration.

For Persistent Uptime: Use Fly.io. It keeps your app running 24/7 within the free tier, which is rare for free hosting.

For Serverless: Use Vercel, but adjust your app to fit a serverless model (e.g., externalize Prisma to a free DB like Supabase).

Since your app uses Prisma, pair it with a free database like Supabase (PostgreSQL, 500 MB storage) or PlanetScale (MySQL, 5 GB storage) to keep everything free. For example:
Deploy the backend to Fly.io.

Host the PostgreSQL database on Supabase (update your DATABASE_URL in .env).

Next Steps
Pick one (I’d start with Fly.io for its balance of free resources and uptime).

Push your code to GitHub if not already done.

Follow the deployment steps above.

Test your endpoints (e.g., POST /api/monthly-expenses) with an Auth0 token.

Let me know if you need help setting up any of these!

