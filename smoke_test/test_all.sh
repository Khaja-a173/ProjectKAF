#!/usr/bin/env bash
set -euo pipefail

# ------------------------------
# CONFIG (edit these for your env)
# ------------------------------
BASE="${BASE:-http://localhost:8090}"
TENANT="${TENANT:-550e8400-e29b-41d4-a716-446655440000}"

# Two AVAILABLE item IDs belonging to TENANT
ITEM_A="${ITEM_A:-1922769b-a27d-42be-9c5e-29a6c2bc7f65}"  # e.g., Grilled Salmon (24.99)
ITEM_B="${ITEM_B:-1356a490-bae5-4361-bbfe-61c42ef55179}"  # e.g., New item (22.20)

# A VALID SECTION that contains items (used for toggle-items tests)
SECTION_ID="${SECTION_ID:-2bc30967-a860-46f1-91e2-651c2b0129f9}"

# Another tenant ID for negative isolation tests (must exist)
OTHER_TENANT="${OTHER_TENANT:-550e8400-e29b-41d4-a716-446655440020}"

# Requirements
command -v jq >/dev/null || { echo "jq is required"; exit 1; }
command -v curl >/dev/null || { echo "curl is required"; exit 1; }

# Colors
RED="\033[31m"; GRN="\033[32m"; YLW="\033[33m"; BLU="\033[34m"; DIM="\033[2m"; RST="\033[0m"

PASS_CNT=0
FAIL_CNT=0
STEP_CNT=0

function step()  { STEP_CNT=$((STEP_CNT+1)); echo -e "${BLU}\n=== [$STEP_CNT] $* ===${RST}"; }
function pass()  { PASS_CNT=$((PASS_CNT+1)); echo -e "${GRN}✔ PASS${RST} $*"; }
function fail()  { FAIL_CNT=$((FAIL_CNT+1)); echo -e "${RED}✘ FAIL${RST} $*"; }
function expect_eq() { # expect_eq "left" "right" "msg"
  if [[ "$1" == "$2" ]]; then pass "$3"; else fail "$3 (got: '$1' expected: '$2')"; fi
}

function curl_json() { # curl_json METHOD PATH [JSON]
  local method="$1"; shift
  local path="$1"; shift || true
  local data="${1:-}"
  if [[ -n "$data" ]]; then
    curl -s -X "$method" "$BASE$path" \
      -H "X-Tenant-Id: $TENANT" -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -s -X "$method" "$BASE$path" -H "X-Tenant-Id: $TENANT"
  fi
}

function totals_math_ok() { # subtotal tax total rate%
  local subtotal tax total rate
  subtotal="$1"; tax="$2"; total="$3"; rate="$4"
  # check ~equal within small epsilon
  python3 - <<PY 2>/dev/null || node -e '
const s=+$0,t=+$1,r=+$2;
const eps=1e-6;
function approx(a,b){return Math.abs(a-b)<eps}
const subtotal=parseFloat(process.argv[1]);
const tax=parseFloat(process.argv[2]);
const total=parseFloat(process.argv[3]);
const rate=parseFloat(process.argv[4]);
const expectTax = subtotal * (rate/100);
const expectTotal = subtotal + expectTax;
if (Math.abs(tax-expectTax)<1e-4 && Math.abs(total-expectTotal)<1e-4) process.exit(0); else process.exit(1);
' "$subtotal" "$tax" "$total" "$rate"
import math,sys
subtotal=float(sys.argv[1]); tax=float(sys.argv[2]); total=float(sys.argv[3]); rate=float(sys.argv[4])
eps=1e-4
ok = abs(tax - subtotal*(rate/100.0))<eps and abs(total - (subtotal+tax))<eps
sys.exit(0 if ok else 1)
PY
}

# ------------------------------
# 1) Start carts
# ------------------------------
step "Start takeaway cart"
CART_TAKE=$(curl_json POST /api/cart/start '{}' | jq -r .cart_id)
if [[ "$CART_TAKE" =~ ^[0-9a-f-]{36}$ ]]; then pass "takeaway cart_id=$CART_TAKE"; else fail "start takeaway"; fi

step "Start dine-in cart (T01)"
DIN=$(curl_json POST /api/cart/start '{"tableCode":"T01"}')
CART_DINE=$(echo "$DIN" | jq -r .cart_id)
MODE_DINE=$(echo "$DIN" | jq -r .mode)
expect_eq "$MODE_DINE" "dine_in" "mode is dine_in"
[[ "$CART_DINE" =~ ^[0-9a-f-]{36}$ ]] && pass "dine-in cart_id=$CART_DINE" || fail "start dine-in"

# ------------------------------
# 2) Add items (takeaway)
# ------------------------------
step "Add ITEM_A qty 1"
ADD1=$(curl_json POST /api/cart/items "$(jq -nc --arg c "$CART_TAKE" --arg i "$ITEM_A" '{cart_id:$c,items:[{menu_item_id:$i,qty:1}]}')")
QTY1=$(echo "$ADD1" | jq '.items[]|select(.menu_item_id=="'"$ITEM_A"'")|.qty' || echo "")
[[ "$QTY1" == "1" ]] && pass "added qty=1" || fail "add qty=1"
SUB=$(echo "$ADD1" | jq -r .totals.subtotal); TAX=$(echo "$ADD1" | jq -r .totals.tax); TOT=$(echo "$ADD1" | jq -r .totals.total)
echo -e "${DIM}subtotal=$SUB tax=$TAX total=$TOT${RST}"

step "Add multiple (ITEM_A x2, ITEM_B x3)"
ADD2=$(curl_json POST /api/cart/items "$(jq -nc --arg c "$CART_TAKE" --arg a "$ITEM_A" --arg b "$ITEM_B" '{cart_id:$c,items:[{menu_item_id:$a,qty:2},{menu_item_id:$b,qty:3}]}')")
QA=$(echo "$ADD2" | jq '.items[]|select(.menu_item_id=="'"$ITEM_A"'")|.qty' || echo "")
QB=$(echo "$ADD2" | jq '.items[]|select(.menu_item_id=="'"$ITEM_B"'")|.qty' || echo "")
[[ "$QA" == "2" ]] && pass "ITEM_A now qty=2" || fail "ITEM_A qty"
[[ "$QB" == "3" ]] && pass "ITEM_B qty=3" || fail "ITEM_B qty"

# ------------------------------
# 3) Update qty (idempotent)
# ------------------------------
step "Update ITEM_A to qty=5 (bulk /items/update)"
UPD1=$(curl_json POST /api/cart/items/update "$(jq -nc --arg c "$CART_TAKE" --arg a "$ITEM_A" '{cart_id:$c,items:[{menu_item_id:$a,qty:5}]}')")
UA=$(echo "$UPD1" | jq '.items[]|select(.menu_item_id=="'"$ITEM_A"'")|.qty' || echo "")
[[ "$UA" == "5" ]] && pass "ITEM_A qty=5" || fail "update to 5"

step "Set ITEM_A qty=0 (remove)"
UPD2=$(curl_json POST /api/cart/items/update "$(jq -nc --arg c "$CART_TAKE" --arg a "$ITEM_A" '{cart_id:$c,items:[{menu_item_id:$a,qty:0}]}')")
# ITEM_A should not exist
GOT=$(echo "$UPD2" | jq '.items[]|select(.menu_item_id=="'"$ITEM_A"'")|.qty' || echo "")
[[ -z "$GOT" ]] && pass "ITEM_A removed" || fail "ITEM_A still present"

# ------------------------------
# 4) Get cart
# ------------------------------
step "GET cart"
GETC=$(curl_json GET "/api/cart/$CART_TAKE")
TITEMS=$(echo "$GETC" | jq -r '.items|length')
[[ "$TITEMS" -ge 0 ]] && pass "fetched cart items=$TITEMS" || fail "get cart"

# ------------------------------
# 5) Section availability
# ------------------------------
step "Toggle all items in section unavailable"
curl_json POST "/api/menu/sections/$SECTION_ID/toggle-items" '{"available":false}' >/dev/null || true
# Try add an item from that section if either ITEM_A or ITEM_B belongs there; this is optional sanity.

# ------------------------------
# 6) Tax config + math
# ------------------------------
step "Tax GET (should exist or default 8%)"
TG=$(curl_json GET /api/tax)
MODE=$(echo "$TG" | jq -r .mode)
TRATE=$(echo "$TG" | jq -r .total_rate)
echo -e "${DIM}mode=$MODE total_rate=$TRATE${RST}"
[[ "$TRATE" != "null" ]] && pass "tax config present" || fail "tax missing"

step "Set tax to components 5%+5%"
TS=$(curl_json POST /api/tax '{"mode":"components","components":[{"code":"CGST","label":"Central GST","rate":5.0},{"code":"SGST","label":"State GST","rate":5.0}]}' | jq -r .total_rate)
expect_eq "$TS" "10" "total_rate becomes 10"

step "Recreate cart and add ITEM_B x1; totals reflect 10%"
C2=$(curl_json POST /api/cart/start '{}' | jq -r .cart_id)
S1=$(curl_json POST /api/cart/items "$(jq -nc --arg c "$C2" --arg b "$ITEM_B" '{cart_id:$c,items:[{menu_item_id:$b,qty:1}]}')")
SUB=$(echo "$S1" | jq -r .totals.subtotal); TAX=$(echo "$S1" | jq -r .totals.tax); TOT=$(echo "$S1" | jq -r .totals.total)
if totals_math_ok "$SUB" "$TAX" "$TOT" 10; then pass "10% tax math OK"; else fail "10% tax math wrong (sub=$SUB tax=$TAX tot=$TOT)"; fi
# Ensure tax_breakdown exists and sums to TAX
TB_SUM=$(echo "$S1" | jq '[.tax_breakdown[]?.amount] | add // 0')
if [[ "$TB_SUM" != "0" ]]; then
  # Compare sums loosely
  if python3 - <<PY 2>/dev/null; then pass "breakdown sums to tax"; else fail "breakdown != tax"; fi
import sys,math
tb=float("$TB_SUM"); tax=float("$TAX")
sys.exit(0 if abs(tb-tax)<1e-4 else 1)
PY
else
  echo -e "${YLW}… No tax_breakdown array (mode may be single); skipping sum check${RST}"
fi

# ------------------------------
# 7) Confirm order
# ------------------------------
step "Confirm should fail for empty cart"
EMPTY=$(curl_json POST /api/cart/start '{}' | jq -r .cart_id)
CF1=$(curl_json POST /api/orders/confirm "$(jq -nc --arg c "$EMPTY" '{cart_id:$c,notes:"no onions"}')")
CODE=$(echo "$CF1" | jq -r .error)
expect_eq "$CODE" "EMPTY_CART" "empty cart rejected"

step "Confirm works with items"
C3=$(curl_json POST /api/cart/start '{}' | jq -r .cart_id)
curl_json POST /api/cart/items "$(jq -nc --arg c "$C3" --arg a "$ITEM_A" '{cart_id:$c,items:[{menu_item_id:$a,qty:2}]}')" >/dev/null
CF_OK=$(curl_json POST /api/orders/confirm "$(jq -nc --arg c "$C3" '{cart_id:$c,notes:"extra spicy"}')")
OID=$(echo "$CF_OK" | jq -r '.order_id // .orderId // .id')
if [[ "$OID" != "null" && -n "$OID" ]]; then pass "order_id=$OID"; else fail "order confirm"; fi

# ------------------------------
# 8) Cross-tenant isolation (negative)
# ------------------------------
step "Cross-tenant GET cart should fail"
CT=$(curl -s -X GET "$BASE/api/cart/$C3" -H "X-Tenant-Id: $OTHER_TENANT" | jq -r .error)
[[ "$CT" == "cart_not_found" || "$CT" == "Not Found" ]] && pass "isolated" || fail "leak across tenant"

# ------------------------------
# 9) Summary
# ------------------------------
echo -e "${BLU}\n=== SUMMARY ===${RST}"
echo -e "Passed: ${GRN}$PASS_CNT${RST}   Failed: ${RED}$FAIL_CNT${RST}"
[[ $FAIL_CNT -eq 0 ]] && exit 0 || exit 1