package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/joho/godotenv"

	categories "github.com/moncef-an/ecom/internal/categories"
	"github.com/moncef-an/ecom/internal/database"
	order "github.com/moncef-an/ecom/internal/order"
	product "github.com/moncef-an/ecom/internal/product"
	"github.com/moncef-an/ecom/internal/redis"
	"github.com/moncef-an/ecom/internal/routes"
	user "github.com/moncef-an/ecom/internal/user"
)

func main() {
	app := fiber.New()

	if err := godotenv.Load(); err != nil {
		log.Println("could not load .env file")
	}

	dsn := os.Getenv("MYSQL_DSN")
	password := os.Getenv("REDIS_PASSWORD")
	addr := os.Getenv("REDIS_ADDR")

	if err := database.Connect(dsn); err != nil {
		log.Fatalf("could not connect to the database: %v", err)
	}

	if err := redis.Connect(password, addr); err != nil {
		log.Fatalf("could not connect to redis: %v", err)
	}

	db := database.GetDB()

	// User Layer
	userRepo := user.NewUserRepository(db)
	userSvc := user.NewUserService(userRepo)
	userHandler := user.NewUserHandler(userSvc)

	// Categories Layer
	categoryRepo := categories.NewCategoryRepository(db)
	categorySvc := categories.NewCategoryService(categoryRepo)
	categoryHandler := categories.NewCategoryHandler(categorySvc)

	// Product Layer
	productRepo := product.NewProductRepository(db)
	productSvc := product.NewProductService(productRepo, categoryRepo)
	productHandler := product.NewProductHandler(productSvc)

	// Order Layer
	orderRepo := order.NewRepository(db)
	orderSvc := order.NewOrderService(orderRepo, productRepo)
	orderHandler := order.NewOrderHandler(orderSvc)

	// Routes Setup
	routes.SetupRoutes(app, userHandler, categoryHandler, productHandler, orderHandler)

	log.Fatal(app.Listen(":3030"))
}