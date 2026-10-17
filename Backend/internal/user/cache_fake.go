package user

import (
	"context"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

var ErrCacheMiss = errors.New("cache miss: key not found")
var ErrTestCacheDB = errors.New("redis connection failure")

type FakeCache struct {
	token map[string]string
	ErrToReturn error
}

func NewFakeCache()*FakeCache{
	return &FakeCache{
		token: make(map[string]string),
	}
}

func (f *FakeCache)SetRefreshToken(ctx context.Context, refreshID, userID string, ttl time.Duration) error {
	if f.ErrToReturn != nil {
		return f.ErrToReturn
	}

	f.token[refreshID] = userID
	return nil
}

func (f *FakeCache)GetRefreshToken(ctx context.Context, refreshID string) (string, error) {
	if f.ErrToReturn != nil {
		return "", f.ErrToReturn
	}
	userID, exists := f.token[refreshID]
	if !exists {
		return "", redis.Nil
	}
	return userID, nil
}

func (f *FakeCache)DeleteRefreshToken(ctx context.Context, refreshID string) error {
	if f.ErrToReturn != nil {
		return f.ErrToReturn
	}
	delete(f.token, refreshID)
	return nil
}