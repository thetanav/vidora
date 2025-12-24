FROM node:18-alpine

RUN apk add ffmpeg

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

CMD ["npm", "start"]
