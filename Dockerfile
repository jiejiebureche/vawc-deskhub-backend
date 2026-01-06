# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package files first (to leverage Docker's cache)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of your backend code
COPY . .

# Render expects your app to listen on a port defined by the environment variable
ENV PORT=10000
EXPOSE 10000

# Start the application
CMD ["node", "src/app.js"]