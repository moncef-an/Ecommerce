package user

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisUserInterface interface{
	SetRefreshToken(ctx context.Context, refreshID, userID string, ttl time.Duration) error 
	GetRefreshToken(ctx context.Context, refreshID string) (string, error)
	DeleteRefreshToken(ctx context.Context, refreshID string) error
}

type UserRedisStore struct {
	client *redis.Client
}

func NewUserRedisStore(client *redis.Client) RedisUserInterface {
	return &UserRedisStore{
		client: client,
	}
}

func (s *UserRedisStore) SetRefreshToken(ctx context.Context, refreshID, userID string, ttl time.Duration) error {
	key := fmt.Sprintf("refresh:%s", refreshID)
	return s.client.Set(ctx, key, userID, ttl).Err()
}

func (s *UserRedisStore) GetRefreshToken(ctx context.Context, refreshID string) (string, error) {
	key := fmt.Sprintf("refresh:%s", refreshID)
	return s.client.Get(ctx, key).Result()
}

func (s *UserRedisStore) DeleteRefreshToken(ctx context.Context, refreshID string) error {
	key := fmt.Sprintf("refresh:%s", refreshID)
	return s.client.Del(ctx, key).Err()
}