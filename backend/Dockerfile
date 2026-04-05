FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Cloud Run sets PORT via env; default to 8080
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/app.js"]
