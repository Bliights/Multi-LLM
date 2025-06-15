FROM node:23-alpine 

# Add working directory
WORKDIR /frontend

# Copy files
COPY . .

# Create user (so that we are not on the root)
RUN adduser -D -h /frontend patrick && chown -R patrick:patrick /frontend

USER patrick

# Install dependencies
RUN npm install

# API on port 4200
# EXPOSE 4200

# Start angular server and allow external acces (0.0.0.0)
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]