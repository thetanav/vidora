FROM node:18-alpine

RUN apk add ffmpeg
RUN apk add curl ca-certificates

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

RUN npm run build

CMD ["npm", "start"]
