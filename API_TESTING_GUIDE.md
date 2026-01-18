# MarketHub Products API - Testing Guide

This guide provides `curl` commands to test all Products API endpoints.

## Base URL
```
http://localhost:5000/api/v1
```

---

## 📋 Public Endpoints (No Authentication Required)

### 1. Get All Products with Filtering & Pagination

```bash
# Basic - Get all products (default: 20 per page)
curl http://localhost:5000/api/v1/products

# With search query
curl "http://localhost:5000/api/v1/products?query=laptop"

# Filter by category (category ID)
curl "http://localhost:5000/api/v1/products?category=1"

# Filter by price range
curl "http://localhost:5000/api/v1/products?min_price=100&max_price=50000"

# Combine filters
curl "http://localhost:5000/api/v1/products?query=samsung&category=1&min_price=1000&max_price=50000"

# Pagination
curl "http://localhost:5000/api/v1/products?page=1&per_page=10"

# Include out-of-stock products
curl "http://localhost:5000/api/v1/products?in_stock=false"

# Pretty print with jq
curl http://localhost:5000/api/v1/products | jq
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Samsung Galaxy S23",
        "description": "Latest Samsung flagship smartphone...",
        "price": 45000.00,
        "stock_quantity": 15,
        "image_url": "https://...",
        "is_active": true,
        "category": {
          "id": 1,
          "name": "Electronics"
        },
        "merchant": {
          "id": 1,
          "name": "TechStore Kenya"
        },
        "created_at": "2024-01-15T10:30:00",
        "updated_at": "2024-01-15T10:30:00"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total_pages": 1,
      "total_items": 8,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

---

### 2. Get Single Product

```bash
# Get product by ID
curl http://localhost:5000/api/v1/products/1

# With jq for pretty printing
curl http://localhost:5000/api/v1/products/1 | jq
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Samsung Galaxy S23",
    "description": "Latest Samsung flagship smartphone...",
    "price": 45000.00,
    "stock_quantity": 15,
    "image_url": "https://...",
    "is_active": true,
    "category": {
      "id": 1,
      "name": "Electronics"
    },
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
}
```

**Error Response (Product Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

---

## 🔐 Merchant Endpoints (Authentication Required)

### 3. Get Merchant's Products

```bash
# Get products for authenticated merchant
curl http://localhost:5000/api/v1/merchant/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Create New Product

```bash
# Create product with form data
curl -X POST http://localhost:5000/api/v1/merchant/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=Wireless Mouse" \
  -F "description=High-precision wireless mouse with ergonomic design. Perfect for both work and gaming." \
  -F "price=1500.00" \
  -F "category_id=1" \
  -F "stock_quantity=50"
```

**With Image Upload:**
```bash
curl -X POST http://localhost:5000/api/v1/merchant/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=Wireless Mouse" \
  -F "description=High-precision wireless mouse..." \
  -F "price=1500.00" \
  -F "category_id=1" \
  -F "stock_quantity=50" \
  -F "image=@/path/to/mouse-image.jpg"
```

---

### 5. Update Product

```bash
# Update product by ID
curl -X PUT http://localhost:5000/api/v1/merchant/products/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=Updated Product Name" \
  -F "price=49999.00" \
  -F "stock_quantity=10"
```

---

### 6. Delete Product (Soft Delete)

```bash
# Delete (deactivate) a product
curl -X DELETE http://localhost:5000/api/v1/merchant/products/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📂 Category Endpoints

### 7. Get All Categories

```bash
# Get all product categories
curl http://localhost:5000/api/v1/categories | jq
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and gadgets"
    },
    {
      "id": 2,
      "name": "Clothing",
      "description": "Fashion and apparel"
    }
  ]
}
```

---

## 🔍 Testing with Authentication

### Login to Get Token

```bash
# Login and get access token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "techstore@markethub.com", "password": "Merchant123!"}'
```

**Login Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "techstore@markethub.com",
      "name": "TechStore Kenya",
      "role": "merchant"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Use Token in Requests

```bash
# Save token and use in requests
ACCESS_TOKEN="your_access_token_here"

curl http://localhost:5000/api/v1/merchant/products \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 🧪 Complete Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api/v1"
TOKEN=""

echo "=== MarketHub Products API Test ==="

# 1. Get all products
echo -e "\n1. Get All Products:"
curl -s "$BASE_URL/products" | jq '.data.products | length'

# 2. Get single product
echo -e "\n2. Get Product #1:"
curl -s "$BASE_URL/products/1" | jq '.data.name'

# 3. Search products
echo -e "\n3. Search for 'Samsung':"
curl -s "$BASE_URL/products?query=samsung" | jq '.data.products[0].name'

# 4. Get categories
echo -e "\n4. Get Categories:"
curl -s "$BASE_URL/categories" | jq '.data | length'

# 5. Login (uncomment and update credentials)
# echo -e "\n5. Login:"
# TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
#   -H "Content-Type: application/json" \
#   -d '{"email": "techstore@markethub.com", "password": "Merchant123!"}' | jq -r '.data.tokens.access_token')
# echo "Token: ${TOKEN:0:50}..."

echo -e "\n=== Test Complete ==="
```

---

## 📊 Query Parameters Summary

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | "" | Search term for name/description |
| `category` | int | null | Filter by category ID |
| `min_price` | float | null | Minimum price filter |
| `max_price` | float | null | Maximum price filter |
| `in_stock` | bool | true | Only show in-stock products |
| `page` | int | 1 | Page number |
| `per_page` | int | 20 | Items per page (max: 50) |

---

## ⚠️ Common Errors

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Not authorized to access this resource |
| 404 | PRODUCT_NOT_FOUND | Product not found |
| 404 | CATEGORY_NOT_FOUND | Category not found |
| 500 | DATABASE_ERROR | Server error |

---

## 🔗 Related Files

- **Backend Routes:** `backend/app/routes/products.py`
- **Backend Model:** `backend/app/models/product.py`
- **Frontend Service:** `frontend/market-app/src/services/productService.js`
- **Seed Data:** `backend/seed_data.py`

