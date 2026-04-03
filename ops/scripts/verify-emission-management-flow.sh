#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage:
  bash ops/scripts/verify-emission-management-flow.sh [base-url]

Purpose:
  Verify that the admin emission management route and API flow work against the
  running local service, including:
  - authenticated webmaster session bootstrap
  - page route and page-data
  - category/tier/variable/factor fetch
  - input session save
  - input session readback
  - calculation execution

Default verification path:
  - category: LIME
  - tier: first available tier
  - input: LIME_TYPE = 고칼슘석회, MLI = 10
  - expected total: 7.5 tCO2
  - expected formula: SUM(EF석회,i * Ml,i)

Environment overrides:
  PORT
  CONFIG_DIR
  ENV_FILE
  EXPECTED_CATEGORY_SUBCODE
  EXPECTED_INPUT_VAR_CODE
  EXPECTED_INPUT_VALUE
  EXPECTED_TIER
  EXPECTED_CO2_TOTAL
  EXPECTED_FORMULA_SUMMARY
  INVALID_INPUT_VAR_CODE
  SAVE_PAYLOAD_JSON
  VERIFY_SAVED_VALUE
  VERIFY_INVALID_VARIABLE_CODE
EOF
  exit 0
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BASE_URL="${1:-http://127.0.0.1:18000}"
PORT="${PORT:-18000}"
CONFIG_DIR="${CONFIG_DIR:-$ROOT_DIR/ops/config}"
ENV_FILE="${ENV_FILE:-$CONFIG_DIR/carbonet-${PORT}.env}"
EXPECTED_CATEGORY_SUBCODE="${EXPECTED_CATEGORY_SUBCODE:-LIME}"
EXPECTED_INPUT_VAR_CODE="${EXPECTED_INPUT_VAR_CODE:-MLI}"
EXPECTED_INPUT_VALUE="${EXPECTED_INPUT_VALUE:-10}"
EXPECTED_TIER="${EXPECTED_TIER:-}"
EXPECTED_CO2_TOTAL="${EXPECTED_CO2_TOTAL:-7.5}"
EXPECTED_FORMULA_SUMMARY="${EXPECTED_FORMULA_SUMMARY:-SUM(EF석회,i * Ml,i)}"
INVALID_INPUT_VAR_CODE="${INVALID_INPUT_VAR_CODE:-INVALID_VAR_CODE}"
SAVE_PAYLOAD_JSON="${SAVE_PAYLOAD_JSON:-}"
VERIFY_SAVED_VALUE="${VERIFY_SAVED_VALUE:-true}"
VERIFY_INVALID_VARIABLE_CODE="${VERIFY_INVALID_VARIABLE_CODE:-true}"

TMP_DIR="$(mktemp -d /tmp/emission-management-flow.XXXXXX)"
CLASSPATH_FILE="$TMP_DIR/runtime.classpath"
JAVA_SOURCE="$TMP_DIR/ForgeEmissionManagementToken.java"
JAVA_CLASS_DIR="$TMP_DIR/classes"
COOKIE_JAR="$TMP_DIR/cookies.txt"
SESSION_JSON="$TMP_DIR/session.json"
HTML_FILE="$TMP_DIR/page.html"
PAGE_DATA_JSON="$TMP_DIR/page-data.json"
CATEGORIES_JSON="$TMP_DIR/categories.json"
TIERS_JSON="$TMP_DIR/tiers.json"
VARIABLES_JSON="$TMP_DIR/variables.json"
LIME_FACTOR_JSON="$TMP_DIR/lime-factor.json"
SAVE_REQUEST_JSON="$TMP_DIR/save-request.json"
SAVE_RESPONSE_JSON="$TMP_DIR/save-response.json"
SESSION_RESPONSE_JSON="$TMP_DIR/input-session.json"
CALC_RESPONSE_JSON="$TMP_DIR/calc-response.json"
INVALID_RESPONSE_JSON="$TMP_DIR/invalid-response.json"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

fail() {
  echo "[verify-emission-management-flow] FAIL: $*" >&2
  exit 1
}

info() {
  echo "[verify-emission-management-flow] $*"
}

load_optional_env() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

require_cmd() {
  local name="$1"
  command -v "$name" >/dev/null 2>&1 || fail "required command not found: $name"
}

require_file() {
  local path="$1"
  [[ -f "$path" ]] || fail "required file not found: $path"
}

load_optional_env "$ENV_FILE"
TOKEN_ACCESS_SECRET="${TOKEN_ACCESS_SECRET:-change-me-access-secret}"
TOKEN_REFRESH_SECRET="${TOKEN_REFRESH_SECRET:-change-me-refresh-secret}"

require_cmd curl
require_cmd mvn
require_cmd javac
require_cmd java
require_cmd python3
require_file "$ROOT_DIR/pom.xml"
require_file "$ROOT_DIR/target/classes/egovframework/com/feature/auth/util/JwtTokenProvider.class"

mkdir -p "$JAVA_CLASS_DIR"

info "building runtime classpath"
mvn -q -f "$ROOT_DIR/pom.xml" -DincludeScope=runtime dependency:build-classpath "-Dmdep.outputFile=$CLASSPATH_FILE" >/dev/null
require_file "$CLASSPATH_FILE"

cat > "$JAVA_SOURCE" <<'EOF'
import egovframework.com.feature.auth.dto.response.LoginResponseDTO;
import egovframework.com.feature.auth.util.JwtTokenProvider;
import org.egovframe.boot.crypto.EgovCryptoConfiguration;
import org.egovframe.boot.crypto.EgovCryptoProperties;
import org.egovframe.boot.crypto.service.impl.EgovEnvCryptoServiceImpl;

public class ForgeEmissionManagementToken {
    public static void main(String[] args) {
        String accessSecret = args.length > 0 ? args[0] : "change-me-access-secret";
        String refreshSecret = args.length > 1 ? args[1] : "change-me-refresh-secret";

        EgovCryptoProperties props = new EgovCryptoProperties();
        props.setAlgorithm("SHA-256");
        props.setAlgorithmKey("egovframe");
        props.setAlgorithmKeyHash("gdyYs/IZqY86VcWhT8emCYfqY1ahw2vtLG+/FzNqtrQ=");

        EgovEnvCryptoServiceImpl crypto = new EgovCryptoConfiguration(props).egovEnvCryptoService();
        JwtTokenProvider provider = new JwtTokenProvider(crypto);

        LoginResponseDTO dto = new LoginResponseDTO();
        dto.setUserId("webmaster");
        dto.setName("webmaster");
        dto.setUniqId("USRCNFRM_99999999999");
        dto.setAuthorList("ROLE_SYSTEM_MASTER");

        try {
            for (String[] item : new String[][] {
                    {"accessSecret", accessSecret},
                    {"refreshSecret", refreshSecret},
                    {"accessExpiration", "3600000"},
                    {"refreshExpiration", "3600000"}
            }) {
                java.lang.reflect.Field field = JwtTokenProvider.class.getDeclaredField(item[0]);
                field.setAccessible(true);
                field.set(provider, item[1]);
            }
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }

        System.out.println(provider.createAccessToken(dto));
    }
}
EOF

javac -cp "$ROOT_DIR/target/classes:$(cat "$CLASSPATH_FILE")" -d "$JAVA_CLASS_DIR" "$JAVA_SOURCE"
ACCESS_TOKEN="$(java -cp "$JAVA_CLASS_DIR:$ROOT_DIR/target/classes:$(cat "$CLASSPATH_FILE")" ForgeEmissionManagementToken "$TOKEN_ACCESS_SECRET" "$TOKEN_REFRESH_SECRET" | tr -d '\r\n')"
[[ -n "$ACCESS_TOKEN" ]] || fail "failed to forge access token"

printf '# Netscape HTTP Cookie File\n' > "$COOKIE_JAR"
printf '127.0.0.1\tFALSE\t/\tFALSE\t0\taccessToken\t%s\n' "$ACCESS_TOKEN" >> "$COOKIE_JAR"

info "verifying authenticated frontend session"
curl -fsS -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE_URL/api/frontend/session" > "$SESSION_JSON" || fail "frontend session request failed"

python3 - <<'PY' "$SESSION_JSON"
import json, sys
session = json.load(open(sys.argv[1], encoding="utf-8"))
if not session.get("authenticated"):
    raise SystemExit("frontend session is not authenticated")
if session.get("actualUserId") != "webmaster":
    raise SystemExit("frontend session actualUserId is not webmaster")
if session.get("authorCode") != "ROLE_SYSTEM_MASTER":
    raise SystemExit("frontend session authorCode is not ROLE_SYSTEM_MASTER")
if "A0020107_VIEW" not in (session.get("featureCodes") or []):
    raise SystemExit("A0020107_VIEW is missing from featureCodes")
if "A0020107_SESSION_SAVE" not in (session.get("featureCodes") or []):
    raise SystemExit("A0020107_SESSION_SAVE is missing from featureCodes")
if "A0020107_CALCULATE" not in (session.get("featureCodes") or []):
    raise SystemExit("A0020107_CALCULATE is missing from featureCodes")
PY
CSRF_INFO="$(python3 - <<'PY' "$SESSION_JSON"
import json, sys
session = json.load(open(sys.argv[1], encoding="utf-8"))
print(session.get("csrfToken") or "")
print(session.get("csrfHeaderName") or "X-CSRF-TOKEN")
PY
)"
CSRF_TOKEN="$(printf '%s\n' "$CSRF_INFO" | sed -n '1p')"
CSRF_HEADER="$(printf '%s\n' "$CSRF_INFO" | sed -n '2p')"
[[ -n "$CSRF_TOKEN" ]] || fail "csrfToken is missing from frontend session"

info "loading admin shell route"
curl -fsS -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE_URL/admin/emission/management" > "$HTML_FILE" || fail "route request failed"
grep -q 'window\.__CARBONET_REACT_BOOTSTRAP__ = config\.reactBootstrapPayload || {};' "$HTML_FILE" || fail "shell bootstrap assignment is missing"

info "loading emission management page-data"
curl -fsS -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE_URL/admin/emission/management/page-data" > "$PAGE_DATA_JSON" || fail "page-data request failed"
python3 - <<'PY' "$PAGE_DATA_JSON"
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
if data.get("menuCode") != "A0020107":
    raise SystemExit("page-data menuCode is not A0020107")
PY

info "loading categories"
curl -fsS -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE_URL/admin/api/admin/emission-management/categories" > "$CATEGORIES_JSON" || fail "categories request failed"
CATEGORY_ID="$(python3 - <<'PY' "$CATEGORIES_JSON" "$EXPECTED_CATEGORY_SUBCODE"
import json, sys
items = json.load(open(sys.argv[1], encoding="utf-8")).get("items") or []
expected = sys.argv[2].strip().upper()
chosen = next((item for item in items if str(item.get("subCode", "")).upper() == expected), None)
if not chosen:
    raise SystemExit(f"category not found for subCode={expected}")
print(chosen.get("categoryId") or "")
PY
)"
[[ -n "$CATEGORY_ID" ]] || fail "failed to resolve category id"

info "loading tiers"
curl -fsS -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE_URL/admin/api/admin/emission-management/categories/$CATEGORY_ID/tiers" > "$TIERS_JSON" || fail "tiers request failed"
TIER="$(python3 - <<'PY' "$TIERS_JSON" "$EXPECTED_TIER"
import json, sys
tiers = json.load(open(sys.argv[1], encoding="utf-8")).get("tiers") or []
expected_tier = sys.argv[2].strip()
if not tiers:
    raise SystemExit("tier list is empty")
if expected_tier:
    chosen = next((item for item in tiers if str(item.get("tier") or "") == expected_tier), None)
    if not chosen:
        raise SystemExit(f"expected tier missing: {expected_tier}")
    print(chosen.get("tier") or "")
    raise SystemExit(0)
print(tiers[0].get("tier") or "")
PY
)"
[[ -n "$TIER" ]] || fail "failed to resolve tier"

info "loading variable definitions"
curl -fsS -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE_URL/admin/api/admin/emission-management/categories/$CATEGORY_ID/tiers/$TIER/variables" > "$VARIABLES_JSON" || fail "variables request failed"
python3 - <<'PY' "$VARIABLES_JSON" "$EXPECTED_INPUT_VAR_CODE"
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
expected_code = sys.argv[2].strip().upper()
variable_codes = [str(item.get("varCode", "")).upper() for item in (data.get("variables") or [])]
if expected_code not in variable_codes:
    raise SystemExit(f"expected variable code is missing: {expected_code}")
PY

info "loading lime default factor"
curl -fsS -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE_URL/admin/api/admin/emission-management/lime/default-factor" > "$LIME_FACTOR_JSON" || fail "lime default factor request failed"

if [[ "$VERIFY_INVALID_VARIABLE_CODE" == "true" ]]; then
  info "verifying invalid variable rejection"
  python3 - <<'PY' "$SAVE_REQUEST_JSON" "$CATEGORY_ID" "$TIER" "$INVALID_INPUT_VAR_CODE"
import json, sys
path, category_id, tier, invalid_var_code = sys.argv[1:5]
payload = {
    "categoryId": int(category_id),
    "tier": int(tier),
    "createdBy": "codex-invalid-check",
    "values": [{"varCode": invalid_var_code, "lineNo": 1, "valueNum": 10.0}]
}
open(path, "w", encoding="utf-8").write(json.dumps(payload, ensure_ascii=False))
PY
  INVALID_STATUS="$(curl -sS -o "$INVALID_RESPONSE_JSON" -w '%{http_code}' -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST -H "$CSRF_HEADER: $CSRF_TOKEN" -H 'Content-Type: application/json' --data @"$SAVE_REQUEST_JSON" "$BASE_URL/admin/api/admin/emission-management/input-sessions")"
  [[ "$INVALID_STATUS" == "500" ]] || fail "invalid variable request should fail with 500 but was $INVALID_STATUS"
  grep -q '"status":"error"' "$INVALID_RESPONSE_JSON" || fail "invalid variable response did not return error payload"
fi

info "saving input session"
if [[ -n "$SAVE_PAYLOAD_JSON" ]]; then
  printf '%s' "$SAVE_PAYLOAD_JSON" > "$SAVE_REQUEST_JSON"
else
python3 - <<'PY' "$SAVE_REQUEST_JSON" "$CATEGORY_ID" "$TIER" "$EXPECTED_INPUT_VALUE"
import json, sys
path, category_id, tier, value = sys.argv[1:5]
payload = {
    "categoryId": int(category_id),
    "tier": int(tier),
    "createdBy": "codex-local-verify",
    "values": [
        {"varCode": "LIME_TYPE", "lineNo": 1, "valueText": "HIGH_CALCIUM"},
        {"varCode": "MLI", "lineNo": 1, "valueNum": float(value)}
    ]
}
open(path, "w", encoding="utf-8").write(json.dumps(payload, ensure_ascii=False))
PY
fi
SAVE_STATUS="$(curl -sS -o "$SAVE_RESPONSE_JSON" -w '%{http_code}' -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST -H "$CSRF_HEADER: $CSRF_TOKEN" -H 'Content-Type: application/json' --data @"$SAVE_REQUEST_JSON" "$BASE_URL/admin/api/admin/emission-management/input-sessions")"
[[ "$SAVE_STATUS" == "200" ]] || fail "save request failed with status $SAVE_STATUS"

SESSION_ID="$(python3 - <<'PY' "$SAVE_RESPONSE_JSON"
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
if not data.get("success"):
    raise SystemExit("save response success flag is false")
print(data.get("sessionId") or "")
PY
)"
[[ -n "$SESSION_ID" ]] || fail "save response did not include sessionId"

info "loading saved input session"
GET_STATUS="$(curl -sS -o "$SESSION_RESPONSE_JSON" -w '%{http_code}' -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$BASE_URL/admin/api/admin/emission-management/input-sessions/$SESSION_ID")"
[[ "$GET_STATUS" == "200" ]] || fail "input session lookup failed with status $GET_STATUS"
if [[ "$VERIFY_SAVED_VALUE" == "true" ]]; then
python3 - <<'PY' "$SESSION_RESPONSE_JSON" "$EXPECTED_INPUT_VAR_CODE" "$EXPECTED_INPUT_VALUE"
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
expected_var = sys.argv[2].strip().upper()
expected_value = float(sys.argv[3])
values = data.get("values") or []
match = next((item for item in values if str(item.get("varCode", "")).upper() == expected_var), None)
if not match:
    raise SystemExit(f"saved varCode not found: {expected_var}")
actual = float(match.get("valueNum"))
if abs(actual - expected_value) > 1e-9:
    raise SystemExit(f"saved value mismatch: expected={expected_value}, actual={actual}")
PY
fi

info "executing calculation"
CALC_STATUS="$(curl -sS -o "$CALC_RESPONSE_JSON" -w '%{http_code}' -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST -H "$CSRF_HEADER: $CSRF_TOKEN" -H 'Content-Type: application/json' --data '{}' "$BASE_URL/admin/api/admin/emission-management/input-sessions/$SESSION_ID/calculate")"
[[ "$CALC_STATUS" == "200" ]] || fail "calculate request failed with status $CALC_STATUS"
python3 - <<'PY' "$CALC_RESPONSE_JSON" "$EXPECTED_CO2_TOTAL" "$EXPECTED_FORMULA_SUMMARY"
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
expected_total = float(sys.argv[2])
expected_formula = sys.argv[3]
actual_total = float(data.get("co2Total"))
if abs(actual_total - expected_total) > 1e-9:
    raise SystemExit(f"co2Total mismatch: expected={expected_total}, actual={actual_total}")
if str(data.get("formulaSummary", "")).strip() != expected_formula:
    raise SystemExit("formulaSummary mismatch")
PY

info "session OK"
info "page-data OK: /admin/emission/management/page-data"
info "category OK: $EXPECTED_CATEGORY_SUBCODE"
info "tier OK: $TIER"
info "save OK: sessionId=$SESSION_ID"
info "calculate OK: co2Total=$EXPECTED_CO2_TOTAL"
info "verification completed"
