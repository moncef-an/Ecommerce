package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/joho/godotenv"

	"github.com/moncef-an/ecom/internal/Categories/handler"
	categoryRepository "github.com/moncef-an/ecom/internal/Categories/repository"
	categoryService "github.com/moncef-an/ecom/internal/Categories/service"

	userRepository "github.com/moncef-an/ecom/internal/User/Repository"
	userService "github.com/moncef-an/ecom/internal/User/Service"
	ProductRepositoy"github.com/moncef-an/ecom/internal/Product/Repository"
	ProductService	"github.com/moncef-an/ecom/internal/Product/service"
	ProductHandler "github.com/moncef-an/ecom/internal/Product/handler"
	"github.com/moncef-an/ecom/internal/User/handlers"

	"github.com/moncef-an/ecom/internal/database"
	"github.com/moncef-an/ecom/internal/redis"
	"github.com/moncef-an/ecom/internal/routes"
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

	userRepo := userRepository.NewUserRepository(db)
	userSvc := userService.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userSvc)

	categoryRepo := categoryRepository.NewCategoryRepo(db)
	CService := categoryService.NewCategoryService(categoryRepo)
	Chandler := handler.NewCategoryHandler(*CService)

	prodyctRepo := ProductRepositoy.NewRepo(db)
	ProductService := ProductService.NewProductService(prodyctRepo,categoryRepo)
	ProductHandler := ProductHandler.NewProductHandler(*ProductService)


	routes.SetupRoutes(app, userHandler,Chandler,ProductHandler)

	log.Fatal(app.Listen(":3030"))
}