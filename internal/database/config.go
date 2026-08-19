package database

import (

	"github.com/pressly/goose/v3"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

func Connect(dsn string)error {
	connection ,err :=gorm.Open(mysql.Open(dsn),&gorm.Config{})
	if err != nil {
		return err
	}

	sqlDB ,err := connection.DB()

	if err !=nil{
		return err
	}

	if err := goose.SetDialect("mysql");err !=nil{
		return err
	}
	if err := goose.Up(sqlDB,"/migration");err !=nil {
		return err
	}

	db = connection
	return nil
}

func GetDB() *gorm.DB{
	return db
}