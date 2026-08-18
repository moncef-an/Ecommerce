package database

import (
	"gorm.io/gorm"
	"gorm.io/driver/mysql"

)

var db *gorm.DB

func Connect(dsn string)error {
	connection ,err :=gorm.Open(mysql.Open(dsn),&gorm.Config{})
	if err != nil {
		return err
	}

	db = connection
	return nil
}

func GetDB() *gorm.DB{
	return db
}