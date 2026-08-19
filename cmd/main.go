package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/joho/godotenv"
	"github.com/moncef-an/ecom/internal/database"
	"github.com/moncef-an/ecom/internal/redis"
)

func main() {
	app := fiber.New()

	godotenv.Load()
	dsn := os.Getenv("MYSQL_DSN")

	password := os.Getenv("REDIS_PASSWORD")
	addr := os.Getenv("REDIS_ADDR")

	if err := database.Connect(dsn);err !=nil{
		log.Fatalf("could not connect to the database %v",err)
	}

	if err := redis.Connect(password,addr);err !=nil{
		log.Fatalf("could not connect to redis %v",err)
	}

	
	log.Fatal(app.Listen(":3030"))

}