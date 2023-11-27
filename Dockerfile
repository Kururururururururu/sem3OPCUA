# Use a Node.js base image
FROM node:14.15.4-alpine3.12

# Set the working directory inside the container
WORKDIR /app

# Copy the application code to the working directory
COPY backend .

# Copy the dist folder from the frontend directory
COPY frontend/dist dist

# Install dependencies
RUN npm install

# Expose the port on which the application will run
EXPOSE 80
EXPOSE 4840

# Set the environment variable for the port
ENV PORT=80
ENV OPC_URL=opc.tcp://host.docker.internal:4840


# Start the application
CMD [ "node", "index.js" ]