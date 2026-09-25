package user

import (
	"context"
	"errors"
	"fmt"

	"net/mail"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/moncef-an/ecom/internal/auth"
	models "github.com/moncef-an/ecom/internal/models"
	"golang.org/x/crypto/bcrypt"
)
type AuthCache interface {
	SetRefreshToken(ctx context.Context, refreshID, userID string, ttl time.Duration) error
	GetRefreshToken(ctx context.Context, refreshID string) (string, error)
	DeleteRefreshToken(ctx context.Context, refreshID string) error
}
var (
	ErrPasswordEmpty    = errors.New("password cannot be empty")
	ErrPasswordTooShort = errors.New("password must be at least 8 characters long")
	ErrInvalidEmail     = errors.New("invalid email")
	ErrPasswordorEmail  = errors.New("invalid email or password")
	ErrEmptyName        = errors.New("cannot use empty name")
	ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")
)

type UserService struct {
	repo UserRepositoryInterface
	authCache AuthCache
}

func NewUserService(r UserRepositoryInterface,ac AuthCache) *UserService {
	return &UserService{
		repo: r,
		authCache: ac,
	}
}

func (s *UserService) Register(ctx context.Context, name, email, password string) error {
	addr, err := mail.ParseAddress(email)
	if err != nil || addr.Address != email {
		return ErrInvalidEmail
	}

	if strings.TrimSpace(name) == "" {
		return ErrEmptyName
	}

	if len(password) == 0 {
		return ErrPasswordEmpty
	}

	if len(password) < 8 {
		return ErrPasswordTooShort
	}

	_, err = s.repo.GetUserByEmail(ctx, email)
	if err == nil {
		return ErrEmailExists
	}

	if !errors.Is(err, ErrUserNotFound) {
		return fmt.Errorf("check user email: %w", err)
	}

	hachedpass, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("error in hashing the password: %w", err)
	}

	newUser := &models.User{
		ID:           uuid.New().String(),
		Name:         name,
		Email:        email,
		PasswordHash: string(hachedpass),
		Role:         models.RoleUser,
	}

	if err := s.repo.CreateUser(ctx, newUser); err != nil {
		return err
	}

	return nil
}

func (s *UserService) Login(ctx context.Context, password, email string) (auth.Token, error) {
	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return auth.Token{}, ErrPasswordorEmail
		}

		return auth.Token{}, fmt.Errorf("login: %w", err)
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(password),
	)
	if err != nil {
		return auth.Token{}, ErrPasswordorEmail
	}

	token, err := auth.GenerateToken(user.ID, user.Role)
	if err != nil {
		return auth.Token{}, fmt.Errorf("generate tokens: %w", err)
	}

	
	err = s.authCache.SetRefreshToken(
		ctx,
		token.RefreshID,
		user.ID,
		auth.RefreshTokenTTL,
	)
	if err != nil {
		return auth.Token{}, fmt.Errorf("store refresh token: %w", err)
	}

	return *token, nil
}

func (s *UserService) RefreshAccessToken(ctx context.Context,refreshTokenStr string,) (*auth.Token, error) {

	claims, err := auth.ValidateToken(refreshTokenStr)
	if err != nil {
		return nil, ErrInvalidRefreshToken
	}

	// 2. Make sure this is a refresh token
	tokenType, ok := claims["type"].(string)
	if !ok || tokenType != "refresh" {
		return nil, ErrInvalidRefreshToken
	}

	// 3. Extract refresh ID and user ID
	refreshID, ok1 := claims["jti"].(string)
	userID, ok2 := claims["user_id"].(string)

	if !ok1 || !ok2 || refreshID == "" || userID == "" {
		return nil, ErrInvalidRefreshToken
	}

	// 4. Check that refresh token still exists in Redis
	storedUserID, err := s.authCache.GetRefreshToken(ctx, refreshID)
	if err != nil {
		return nil, ErrInvalidRefreshToken
	}

	// 5. Make sure the Redis token belongs to the same user
	if storedUserID != userID {
		return nil, ErrInvalidRefreshToken
	}

	// 6. Get current user
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("fetch user for token refresh: %w", err)
	}

	// 7. Generate a completely new Access + Refresh pair
	newToken, err := auth.GenerateToken(user.ID, user.Role)
	if err != nil {
		return nil, fmt.Errorf("generate rotated tokens: %w", err)
	}

	// 8. Delete the OLD refresh token
	if err := s.authCache.DeleteRefreshToken(ctx, refreshID); err != nil {
		return nil, fmt.Errorf("revoke old refresh token: %w", err)
	}

	// 9. Store the NEW refresh token
	if err := s.authCache.SetRefreshToken(
		ctx,
		newToken.RefreshID,
		user.ID,
		auth.RefreshTokenTTL,
	); err != nil {
		return nil, fmt.Errorf("store new refresh token: %w", err)
	}

	return newToken, nil
}


func (s *UserService) Logout(ctx context.Context, refreshID string) error {
	if strings.TrimSpace(refreshID) == "" {
		return errors.New("refresh ID is required")
	}
	return s.authCache.DeleteRefreshToken(ctx, refreshID)
}