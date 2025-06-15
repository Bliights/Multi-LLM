# Create builder image
FROM node:23 AS builder

# Add working directory for Kaniko
WORKDIR /builder_backend-auth

# Copy files
COPY . .

# Install dependencies and compile TS file in /dist
RUN npm install && npx tsc

# Create final image
FROM node:23-alpine 

# Set to production mode
ENV NODE_ENV=production

# Add working directory
WORKDIR /backend-auth

COPY --from=builder /builder_backend-auth/package.json /builder_backend-auth/package-lock.json ./
COPY --from=builder /builder_backend-auth/dist ./dist

# Create user (so that we are not on the root)
RUN adduser -D -h /backend-auth patrick && chown -R patrick:patrick /backend-auth

USER patrick

# install dependencies + clean npm cache and delete apk temp and /temp files
RUN npm install --only=production && npm cache clean --force && rm -rf /var/cache/apk/* /tmp/* 

# API on port 3000
# EXPOSE 3000

# Launch express server
CMD ["node", "./dist/main.js"]
