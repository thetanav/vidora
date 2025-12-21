FROM jrottenberg/ffmpeg:6.1-alpine

WORKDIR /worker

# optional: add node/bun if you want JS logic
RUN apk add --no-cache nodejs npm

COPY worker.js .

CMD ["node", "worker.js"]
