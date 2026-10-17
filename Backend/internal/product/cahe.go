package product

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/moncef-an/ecom/internal/models"
)


var ErrCacheMiss = errors.New("cache miss: key does not exist")

type ProductListResult struct {
	Products []models.Product `json:"products"`
	Total    int64            `json:"total"`
}


type ProductCache interface {
	Get(ctx context.Context, key string) (*ProductListResult, error)
	GetOne(ctx context.Context, key string) (*models.Product, error)
	Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error
	Delete(ctx context.Context, keys ...string) error
	DeleteByPattern(ctx context.Context, pattern string) error
}

type redisProductCache struct {
	rdb *redis.Client
}


func NewProductCache(rdb *redis.Client) ProductCache {
	return &redisProductCache{rdb: rdb}
}


func (c *redisProductCache) Get(ctx context.Context, key string) (*ProductListResult, error) {
	val, err := c.rdb.Get(ctx, key).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, ErrCacheMiss
		}
		return nil, err
	}

	var products ProductListResult
	if err := json.Unmarshal([]byte(val),&products);err !=nil {
		return nil,err
	} 
	return &products , nil
}

func (c *redisProductCache) GetOne(ctx context.Context, key string) (*models.Product, error){
	val , err := c.rdb.Get(ctx,key).Result()
	if err != nil {
		if errors.Is(err,redis.Nil){
			return nil,ErrCacheMiss
		}
		return nil,err
	}
	var product models.Product
	if err := json.Unmarshal([]byte(val),&product);err !=nil{
		return nil ,err 
	}
	return &product,nil
}

func (c *redisProductCache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data , err := json.Marshal(value)
	if err != nil {
		return err
	}

	return c.rdb.Set(ctx,key,data,ttl).Err()
}

func (c *redisProductCache) Delete(ctx context.Context, keys ...string) error{
	if len(keys)== 0 {
		return nil 
	}
	return c.rdb.Del(ctx,keys...).Err()
}

func (c *redisProductCache) DeleteByPattern(ctx context.Context, pattern string) error {
	var cursor uint64
	for {
	
		keys, nextCursor, err := c.rdb.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return err
		}

		if len(keys) > 0 {
			if err := c.rdb.Del(ctx, keys...).Err(); err != nil {
				return err
			}
		}

		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}
	return nil
}