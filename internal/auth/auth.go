package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	models "github.com/moncef-an/ecom/internal/models"
)

type Token struct {
	AccessToken  string
	RefreshToken string
	RefreshID    string
}

const (
	accessTokenTTL  = 15 * time.Minute
	RefreshTokenTTL = 7 * 24 * time.Hour
)

func GenerateToken(userID string, userRole models.Role)(*Token,error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET is not set")
	}

	accessToken,err :=GenerateAccessToken(userID,userRole)
	if err != nil {
		return nil , err 
	} 
	refreshID := uuid.NewString()

	refreshClaims := jwt.MapClaims{
		"user_id": userID,
		"jti":     refreshID,
		"exp":     time.Now().Add(RefreshTokenTTL).Unix(),
		"iat":     time.Now().Unix(),
		"type":    "refresh",
	} 
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString([]byte(secret))
	if err != nil {
		return nil, err
	}
	return &Token{
		AccessToken:  accessToken,
		RefreshToken: signedRefreshToken,
		RefreshID:    refreshID,
	}, nil
}

func ValidateToken(tokenString string) (jwt.MapClaims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET is not set")
	}

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func GenerateAccessToken(userId string , userRole models.Role)(string,error){
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET is not set")
	}
	accessClaims := jwt.MapClaims{
		"user_id": userId,
		"role":    userRole,
		"exp":     time.Now().Add(accessTokenTTL).Unix(),
		"iat":     time.Now().Unix(),
		"type":    "access",
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256,accessClaims)

	return accessToken.SignedString([]byte(secret))
}