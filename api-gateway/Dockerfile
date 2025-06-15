# Create builder image
FROM node:23 AS builder

# Add working directory for Kaniko
WORKDIR /builder_api-gateway

# Copy files
COPY . .

# Install dependencies and compile TS file in /dist
RUN npm install && npx tsc

# Create final image
FROM node:23-alpine 

# Set to production mode
ENV NODE_ENV=production

# Add working directory
WORKDIR /api-gateway

COPY --from=builder /builder_api-gateway/package.json /builder_api-gateway/package-lock.json ./
COPY --from=builder /builder_api-gateway/dist ./dist

# Create user (so that we are no on the root)
RUN adduser -D -h /api-gateway patrick && chown -R patrick:patrick /api-gateway

USER patrick

# install dependencies + clean npm cache and delete apk temp and /temp files
RUN npm install --only=production && npm cache clean --force && rm -rf /var/cache/apk/* /tmp/* 

# API on port 4200
# EXPOSE 4200

# Launch express server
CMD ["node", "./dist/main.js"]
