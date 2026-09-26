package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/joho/godotenv"

	cart "github.com/moncef-an/ecom/internal/cart"
	categories "github.com/moncef-an/ecom/internal/categories"
	"github.com/moncef-an/ecom/internal/database"
	"github.com/moncef-an/ecom/internal/middleware"
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
	rdb := redis.GetRedis()
	rateLimiter := middleware.NewRedisRateLimiter(rdb)

	// User Layer
	cache := user.NewUserRedisStore(rdb)
	userRepo := user.NewUserRepository(db)
	userSvc := user.NewUserService(userRepo,cache)
	userHandler := user.NewUserHandler(userSvc)

	// Categories Layer
	categoryRepo := categories.NewCategoryRepository(db)
	categorySvc := categories.NewCategoryService(categoryRepo)
	categoryHandler := categories.NewCategoryHandler(categorySvc)

	// Product Layer
	newProductCache := product.NewProductCache(rdb)
	productRepo := product.NewProductRepository(db)
	productSvc := product.NewProductService(productRepo, categoryRepo, newProductCache)
	productHandler := product.NewProductHandler(productSvc)

	// Order Layer
	orderRepo := order.NewRepository(db)
	orderSvc := order.NewService(orderRepo)
	orderHandler := order.NewHandler(orderSvc)

	// Cart Layer
	cartRepo := cart.NewRepository(db)
	cartSvc := cart.NewCartService(cartRepo)
	cartHandler := cart.NewCartHandler(cartSvc)

	// Routes Setup
	routes.SetupRoutes(app, userHandler, categoryHandler, productHandler, orderHandler, cartHandler,rateLimiter)

	log.Fatal(app.Listen(":3030"))
}