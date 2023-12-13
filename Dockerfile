# Use a Node.js base image
FROM node:14.15.4-alpine3.12

# Set the working directory inside the container
WORKDIR /app

# Copy the application code to the working directory
COPY backend /app/backend

# Copy the dist folder from the frontend directory
COPY frontend/dist /app/frontend/dist

# Install dependencies in backend directory and then frontend directory
WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install

WORKDIR /app/backend/OPC
RUN npm install

# Copy the frontend build to the backend directory
WORKDIR /app

# Expose the port on which the application will run
EXPOSE 80
EXPOSE 4840

# Set the environment variable for the port
ENV PORT=80
ENV OPC_URL=opc.tcp://host.docker.internal:4840

WORKDIR /app/backend

# Start the application
CMD [ "node", "index.js" ]