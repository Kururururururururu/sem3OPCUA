# Use a Node.js base image
FROM node:14.15.4-alpine3.12

# Set the working directory inside the container
WORKDIR /app

# Copy the application code to the working directory
COPY backend /app/backend

# Copy the dist folder from the frontend directory
COPY frontend /app/frontend

# Install dependencies in backend directory and then frontend directory
WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app/backend/OPC
RUN npm install

# Copy the frontend build to the backend directory
WORKDIR /app

# Expose the port on which the application will run
EXPOSE 3000
EXPOSE 4840

# Set the environment variable for the port
ENV PORT=3000
ENV OPC_URL=opc.tcp://host.docker.internal:4840
ENV PG_HOST=monorail.proxy.rlwy.net
ENV PG_PORT=55193
ENV PG_USER=postgres
ENV PG_PASSWORD=c1CA1Dg-A15Ce5a5caGDDbcf3aaaFCgC
ENV PG_DATABASE=railway

WORKDIR /app/backend

# Start the application
CMD [ "node", "index.js" ]