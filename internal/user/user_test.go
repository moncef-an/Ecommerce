package user

import (
	"errors"
	"testing"

	models "github.com/moncef-an/ecom/internal/models"
	"golang.org/x/crypto/bcrypt"
)

var ErrTestDB = errors.New("db connection lost")

func TestRegister(t *testing.T) {
	tests := []struct {
		name        string
		setupRepo   func(repo *FakeUserRepository)
		input       RegisterReq
		expectedErr error
	}{
		{
			name:        "invalid email",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "moncef", Email: "invalidemail", Password: "securePassword123"},
			expectedErr: ErrInvalidEmail,
		},
		{
			name:        "empty name",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "    ", Email: "moncef@example.com", Password: "securePassword123"},
			expectedErr: ErrEmptyName,
		},
		{
			name:        "empty password",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: ""},
			expectedErr: ErrPasswordEmpty,
		},
		{
			name:        "short password",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: "123"},
			expectedErr: ErrPasswordTooShort,
		},
		{
			name:        "successful registration",
			setupRepo:   func(repo *FakeUserRepository) {},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: "securePassword123"},
			expectedErr: nil,
		},
		{
			name: "email already exists",
			setupRepo: func(repo *FakeUserRepository) {
				repo.users["moncef@example.com"] = &models.User{
					Name:  "moncef",
					Email: "moncef@example.com",
				}
			},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: "securePassword123"},
			expectedErr: ErrEmailExists,
		},
		{
			name: "repository error",
			setupRepo: func(repo *FakeUserRepository) {
				repo.errToReturn = ErrTestDB
			},
			input:       RegisterReq{Name: "moncef", Email: "moncef@example.com", Password: "securePassword123"},
			expectedErr: ErrTestDB,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fakeRepo := NewTestRepo()
			tt.setupRepo(fakeRepo)

			service := NewUserService(fakeRepo, nil)

			err := service.Register(t.Context(), tt.input.Name, tt.input.Email, tt.input.Password)

			if !errors.Is(err, tt.expectedErr) {
				t.Fatalf("Register() error = %v, expectedErr %v", err, tt.expectedErr)
			}

			if tt.expectedErr == nil {
				savedUser, getErr := fakeRepo.GetUserByEmail(t.Context(), tt.input.Email)
				if getErr != nil || savedUser == nil {
					t.Fatalf("user was not saved to repository: %v", getErr)
				}

				if savedUser.Name != tt.input.Name {
					t.Errorf("got name %q, want %q", savedUser.Name, tt.input.Name)
				}
				if savedUser.Email != tt.input.Email {
					t.Errorf("got email %q, want %q", savedUser.Email, tt.input.Email)
				}
				if savedUser.PasswordHash == "" {
					t.Error("password hash is empty")
				}
				if savedUser.PasswordHash == tt.input.Password {
					t.Error("password was stored as plain text")
				}
			}
		})
	}
}

func TestLogin(t *testing.T) {

	t.Setenv("JWT_SECRET", "my-super-secret-test-key")

	validPassword := "password123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(validPassword), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("failed to generate password hash: %v", err)
	}

	tests := []struct {
		name        string
		setupRepo   func(repo *FakeUserRepository)
		setupCache  func(cache *FakeCache)
		input       LoginReq
		expectedErr error
	}{
		{
			name: "valid credentials",
			setupRepo: func(repo *FakeUserRepository) {
				user := &models.User{
					ID:           "test-user-id",
					Name:         "testuser",
					Email:        "test@example.com",
					PasswordHash: string(hashedPassword),
				}
				repo.users[user.Email] = user
			},
			setupCache:  func(cache *FakeCache) {},
			input:       LoginReq{Email: "test@example.com", Password: validPassword},
			expectedErr: nil,
		},
		{
			name:        "user not found",
			setupRepo:   func(repo *FakeUserRepository) {},
			setupCache:  func(cache *FakeCache) {},
			input:       LoginReq{Email: "nonexistent@example.com", Password: validPassword},
			expectedErr: ErrPasswordorEmail,
		},
		{
			name: "wrong password",
			setupRepo: func(repo *FakeUserRepository) {
				user := &models.User{
					ID:           "test-user-id",
					Name:         "testuser",
					Email:        "test@example.com",
					PasswordHash: string(hashedPassword),
				}
				repo.users[user.Email] = user
			},
			setupCache:  func(cache *FakeCache) {},
			input:       LoginReq{Email: "test@example.com", Password: "wrongpassword"},
			expectedErr: ErrPasswordorEmail,
		},
		{
			name: "repository error",
			setupRepo: func(repo *FakeUserRepository) {
				repo.errToReturn = ErrTestDB
			},
			setupCache:  func(cache *FakeCache) {},
			input:       LoginReq{Email: "test@example.com", Password: validPassword},
			expectedErr: ErrTestDB,
		},
		{
			name: "cache error",
			setupRepo: func(repo *FakeUserRepository) {
				user := &models.User{
					ID:           "test-user-id",
					Name:         "testuser",
					Email:        "test@example.com",
					PasswordHash: string(hashedPassword),
				}
				repo.users[user.Email] = user
			},
			setupCache: func(cache *FakeCache) {
				cache.ErrToReturn = ErrTestCacheDB
			},
			input:       LoginReq{Email: "test@example.com", Password: validPassword},
			expectedErr: ErrTestCacheDB,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fakeRepo := NewTestRepo()
			tt.setupRepo(fakeRepo)

			fakeCache := NewFakeCache()
			tt.setupCache(fakeCache)

			service := NewUserService(fakeRepo, fakeCache)

			token, err := service.Login(t.Context(), tt.input.Password, tt.input.Email)

			if !errors.Is(err, tt.expectedErr) {
				t.Fatalf("Login() error = %v, expectedErr %v", err, tt.expectedErr)
			}

			if tt.expectedErr == nil {
				if token.AccessToken == "" {
					t.Error("Access token is empty")
				}
				if token.RefreshToken == "" {
					t.Error("Refresh token is empty")
				}
				if token.RefreshID == "" {
					t.Error("Refresh ID is empty")
				}
			}
		})
	}
}