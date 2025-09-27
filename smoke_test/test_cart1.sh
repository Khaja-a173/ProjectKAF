#!/usr/bin/env bash
set -euo pipefail

TEN="550e8400-e29b-41d4-a716-446655440000"

# Pick a couple of real menu_items for your tenant
ITEM_A="1356a490-bae5-4361-bbfe-61c42ef55179"  # New item (22.20)
ITEM_B="1922769b-a27d-42be-9c5e-29a6c2bc7f65"  # Grilled Salmon (24.99)

echo "Starting 5 carts..."
C1=$(curl -s -X POST http://localhost:8090/api/cart/start \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" -d '{}' | jq -r .cart_id)
C2=$(curl -s -X POST http://localhost:8090/api/cart/start \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" -d '{}' | jq -r .cart_id)
C3=$(curl -s -X POST http://localhost:8090/api/cart/start \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" -d '{}' | jq -r .cart_id)
C4=$(curl -s -X POST http://localhost:8090/api/cart/start \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" -d '{}' | jq -r .cart_id)
C5=$(curl -s -X POST http://localhost:8090/api/cart/start \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" -d '{}' | jq -r .cart_id)

echo "CARTS: $C1 $C2 $C3 $C4 $C5"

echo "Adding items..."
# Customer 1: 2x ITEM_A
curl -s -X POST http://localhost:8090/api/cart/items \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$C1\",\"items\":[{\"menu_item_id\":\"$ITEM_A\",\"qty\":2}]}" | jq .

# Customer 2: 2x ITEM_B
curl -s -X POST http://localhost:8090/api/cart/items \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$C2\",\"items\":[{\"menu_item_id\":\"$ITEM_B\",\"qty\":2}]}" | jq .

# Customer 3: 1x A + 1x B
curl -s -X POST http://localhost:8090/api/cart/items \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$C3\",\"items\":[{\"menu_item_id\":\"$ITEM_A\",\"qty\":1},{\"menu_item_id\":\"$ITEM_B\",\"qty\":1}]}" | jq .

# Customer 4: 3x A
curl -s -X POST http://localhost:8090/api/cart/items \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$C4\",\"items\":[{\"menu_item_id\":\"$ITEM_A\",\"qty\":3}]}" | jq .

# Customer 5: 1x B
curl -s -X POST http://localhost:8090/api/cart/items \
  -H "X-Tenant-Id: $TEN" -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$C5\",\"items\":[{\"menu_item_id\":\"$ITEM_B\",\"qty\":1}]}" | jq .

echo "Reading back each cart..."
for CID in "$C1" "$C2" "$C3" "$C4" "$C5"; do
  echo "---- $CID ----"
  curl -s -X GET "http://localhost:8090/api/cart/$CID" -H "X-Tenant-Id: $TEN" | jq .
done