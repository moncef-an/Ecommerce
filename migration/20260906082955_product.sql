-- +goose Up
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    category_id VARCHAR(36) NOT NULL,
    seller_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_categories 
        FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,

    CONSTRAINT fk_products_sellers 
        FOREIGN KEY (seller_id) REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS products;