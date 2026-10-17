package redis

import (
	"context"

	"github.com/redis/go-redis/v9"
)

var rdb *redis.Client
var ctx = context.Background()
func Connect(password ,addr string)error{
	rdb = redis.NewClient(&redis.Options{
		Password: password,
		Addr: addr,
		DB: 0,
	})
	if err :=rdb.Ping(ctx).Err();err !=nil{
		return err
	}
	return nil
}

func GetRedis() *redis.Client {
	return rdb
}