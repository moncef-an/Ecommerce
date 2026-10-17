package middleware

import (
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
)

type RateLimiter interface {
	Allow(ctx context.Context, key string, limit int, window time.Duration) (bool, error)
}

type RedisRateLimiter struct {
	client *redis.Client
}

func NewRedisRateLimiter(client *redis.Client) *RedisRateLimiter {
	return &RedisRateLimiter{
		client: client,
	}
}

func (r *RedisRateLimiter) Allow(
	ctx context.Context,
	key string,
	limit int,
	window time.Duration,
) (bool, error) {
	count, err := r.client.Incr(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("rate limiter incr: %w", err)
	}

	if count == 1 {
		if err := r.client.Expire(ctx, key, window).Err(); err != nil {
			return false, fmt.Errorf("rate limiter expire: %w", err)
		}
	}

	if count > int64(limit) {
		return false, nil
	}

	return true, nil
}

func RateLimitMiddleware(
	limiter RateLimiter,
	name string,
	limit int,
	window time.Duration,
) fiber.Handler {
	return func(c fiber.Ctx) error {
		ip := c.IP()

		key := fmt.Sprintf("ratelimit:%s:%s", name, ip)

		allowed, err := limiter.Allow(
			c.Context(),
			key,
			limit,
			window,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "internal server error",
			})
		}

		if !allowed {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "too many requests",
			})
		}

		return c.Next()
	}
}