FROM node

RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

CMD ["npm", "run", "dev"]
