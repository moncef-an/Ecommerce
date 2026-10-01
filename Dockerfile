# Build Stage
FROM golang:alpine AS builder

WORKDIR /app

# Copy go mod files first to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
# CGO_ENABLED=0 creates a statically linked binary which runs without issues in alpine/scratch
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/api ./cmd/main.go

# Final Stage
FROM alpine:latest

WORKDIR /app

# Install tzdata if needed for timezone handling in MySQL connection
RUN apk --no-cache add ca-certificates tzdata

# Copy the built binary and migration files from the builder stage
COPY --from=builder /app/api .
COPY --from=builder /app/migration ./migration

# Expose the port the app runs on
EXPOSE 3030

# Command to run the executable
CMD ["./api"]
