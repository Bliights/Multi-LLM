# Create builder image
FROM rust:1.85 AS builder

# Copy files
COPY . .

# Create final executable ( Install musl for Static binary)
RUN apt-get update && apt-get install -y musl-tools pkg-config \
    && rustup target add x86_64-unknown-linux-musl && \
    cargo build --release --target x86_64-unknown-linux-musl

# Create final image
FROM alpine:3.21.3

# Install SSL certificates
RUN apk add --no-cache ca-certificates

# Copy executable and dependecy required for the binary
COPY --from=builder /target/x86_64-unknown-linux-musl/release/backend-ai /app/backend-ai

# Create user (so that we are not on the root)
RUN adduser -D -h /app patrick && chown -R patrick:patrick /app

USER patrick

# API on port 8080
# EXPOSE 8080

# Execute binary
CMD ["/app/backend-ai"]