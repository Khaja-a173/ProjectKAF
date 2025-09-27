#!/usr/bin/env bash
set -euo pipefail

TENANT="550e8400-e29b-41d4-a716-446655440000"
BASE_URL="http://localhost:8090/api/cart"

echo "=== 1. Start new cart (takeaway) ==="
CART=$(curl -s -X POST $BASE_URL/start \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r .cart_id)
echo "CART=$CART"

echo
echo "=== 2. Add available item ==="
ITEM1="1922769b-a27d-42be-9c5e-29a6c2bc7f65" # Grilled Salmon
curl -s -X POST $BASE_URL/items \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$CART\",\"items\":[{\"menu_item_id\":\"$ITEM1\",\"qty\":1}]}" | jq

echo
echo "=== 3. Try adding unavailable item ==="
ITEM_UNAVAILABLE="e3012f7e-d1a0-43db-b6aa-c81f06001091" # mark this unavailable in DB
curl -s -X POST $BASE_URL/items \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$CART\",\"items\":[{\"menu_item_id\":\"$ITEM_UNAVAILABLE\",\"qty\":1}]}" | jq

echo
echo "=== 4. Update item qty to 0 (remove) ==="
curl -s -X POST $BASE_URL/items/update \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$CART\",\"menu_item_id\":\"$ITEM1\",\"qty\":0}" | jq

echo
echo "=== 5. Invalid cart id ==="
curl -s -X POST $BASE_URL/items \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"00000000-0000-0000-0000-000000000000\",\"items\":[{\"menu_item_id\":\"$ITEM1\",\"qty\":1}]}" | jq

echo
echo "=== 6. Multiple items totals check ==="
CART2=$(curl -s -X POST $BASE_URL/start \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r .cart_id)
ITEM2="1356a490-bae5-4361-bbfe-61c42ef55179" # New Item

curl -s -X POST $BASE_URL/items \
  -H "X-Tenant-Id: $TENANT" \
  -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$CART2\",\"items\":[
    {\"menu_item_id\":\"$ITEM1\",\"qty\":2},
    {\"menu_item_id\":\"$ITEM2\",\"qty\":3}
  ]}" | jq