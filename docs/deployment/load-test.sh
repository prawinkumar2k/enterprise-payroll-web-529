#!/bin/bash

# ============================================
# Load Test Suite - Enterprise Payroll System
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_URL="http://localhost:5001"
RESULTS_DIR="./load-test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create results directory
mkdir -p $RESULTS_DIR

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 LOAD TEST VALIDATION SUITE${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js required${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker required${NC}"; exit 1; }

# Get admin token for authenticated tests
echo -e "${YELLOW}🔑 Obtaining authentication token...${NC}"
TOKEN=$(node -e "
fetch('${BACKEND_URL}/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({userId: 'admin', password: 'admin'})
})
.then(r => r.json())
.then(d => console.log(d.accessToken))
.catch(e => {console.error('Auth failed:', e); process.exit(1)})
")

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to obtain auth token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtained${NC}"
echo ""

# ============================================
# TEST 1: Authentication Storm
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 1: Authentication Storm${NC}"
echo -e "${BLUE}========================================${NC}"

node << 'EOF' > $RESULTS_DIR/auth_storm_$TIMESTAMP.json
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const CONCURRENT = 100;
const DURATION_SEC = 30;

async function authStorm() {
  const results = {
    test: 'Authentication Storm',
    concurrent: CONCURRENT,
    duration: DURATION_SEC,
    requests: 0,
    success: 0,
    errors: 0,
    rateLimited: 0,
    responseTimes: [],
    errors_detail: []
  };

  const startTime = Date.now();
  const endTime = startTime + (DURATION_SEC * 1000);

  console.log(`Starting ${CONCURRENT} concurrent auth requests for ${DURATION_SEC}s...`);

  while (Date.now() < endTime) {
    const batch = Array(CONCURRENT).fill(0).map(async () => {
      const reqStart = Date.now();
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({userId: 'admin', password: 'admin'})
        });
        
        const responseTime = Date.now() - reqStart;
        results.requests++;
        results.responseTimes.push(responseTime);

        if (res.status === 200) {
          results.success++;
        } else if (res.status === 429) {
          results.rateLimited++;
        } else {
          results.errors++;
          results.errors_detail.push({status: res.status, time: new Date().toISOString()});
        }
      } catch (err) {
        results.errors++;
        results.errors_detail.push({error: err.message, time: new Date().toISOString()});
      }
    });

    await Promise.all(batch);
  }

  // Calculate statistics
  results.responseTimes.sort((a, b) => a - b);
  results.avgResponseTime = Math.round(results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length);
  results.p95ResponseTime = results.responseTimes[Math.floor(results.responseTimes.length * 0.95)];
  results.p99ResponseTime = results.responseTimes[Math.floor(results.responseTimes.length * 0.99)];
  results.minResponseTime = results.responseTimes[0];
  results.maxResponseTime = results.responseTimes[results.responseTimes.length - 1];
  results.errorRate = ((results.errors / results.requests) * 100).toFixed(2) + '%';

  console.log(JSON.stringify(results, null, 2));
}

authStorm().catch(console.error);
EOF

echo -e "${GREEN}✅ Authentication Storm Complete${NC}"
echo ""

# ============================================
# TEST 2: Container Resource Monitoring
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 2: Container Resource Baseline${NC}"
echo -e "${BLUE}========================================${NC}"

docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" > $RESULTS_DIR/docker_stats_baseline_$TIMESTAMP.txt
cat $RESULTS_DIR/docker_stats_baseline_$TIMESTAMP.txt

echo ""

# ============================================
# TEST 3: Database Connection Pool Status
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 3: Database Status Check${NC}"
echo -e "${BLUE}========================================${NC}"

# This would require MySQL access - placeholder for now
echo "Database connection pool monitoring requires direct MySQL access"
echo "Run: docker exec payroll-mysql mysql -u root -p -e 'SHOW PROCESSLIST;'"
echo ""

# ============================================
# TEST 4: Health Check Validation
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TEST 4: Health Check Validation${NC}"
echo -e "${BLUE}========================================${NC}"

for i in {1..10}; do
  HEALTH_STATUS=$(curl -s ${BACKEND_URL}/api/health | node -e "const data=require('fs').readFileSync(0,'utf-8'); try{const j=JSON.parse(data); console.log(j.status || 'unknown')}catch(e){console.log('error')}")
  echo "Health check $i: $HEALTH_STATUS"
  sleep 1
done

echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📊 TEST RESULTS SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Results saved to: $RESULTS_DIR"
echo ""
echo -e "${YELLOW}Review detailed results:${NC}"
echo "  - Authentication Storm: $RESULTS_DIR/auth_storm_$TIMESTAMP.json"
echo "  - Docker Stats: $RESULTS_DIR/docker_stats_baseline_$TIMESTAMP.txt"
echo ""
echo -e "${GREEN}✅ Load test suite complete${NC}"
