# Use lightweight Node.js image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and lock file first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy all remaining files
COPY . .

# Expose no ports (it's just a background worker)
CMD ["npm", "start"]
