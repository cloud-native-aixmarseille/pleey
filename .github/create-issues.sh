#!/bin/bash

# Script to create GitHub issues from templates for MMO Game Feature
# Usage: ./create-issues.sh

set -e

REPO="cloud-native-aixmarseille/quiz-app"
TEMPLATE_DIR=".github/ISSUE_TEMPLATE"

echo "🎮 Creating MMO Game Feature Issues"
echo "======================================"
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Create labels if they don't exist
echo "📝 Creating labels..."
gh label create "game-feature" --description "MMO game feature work" --color "FF6B35" --force || true
gh label create "phase-1" --description "Phase 1: WebSocket Infrastructure" --color "4ECDC4" --force || true
gh label create "phase-2" --description "Phase 2: Performance & Scalability" --color "F7B801" --force || true
gh label create "phase-3" --description "Phase 3: Frontend Performance & UX" --color "A569BD" --force || true
gh label create "phase-4" --description "Phase 4: Security & Reliability" --color "E74C3C" --force || true
gh label create "phase-5" --description "Phase 5: Testing & Monitoring" --color "3498DB" --force || true
gh label create "p0-critical" --description "Critical priority" --color "B60205" --force || true
gh label create "p1-high" --description "High priority" --color "D93F0B" --force || true
gh label create "p2-medium" --description "Medium priority" --color "FBCA04" --force || true

echo "✅ Labels created"
echo ""

# Function to create issue from template
create_issue() {
    local template_file=$1
    local title=$2
    local labels=$3
    
    echo "📄 Creating issue: $title"
    
    # Extract body from template (skip frontmatter)
    body=$(awk '/^---$/{flag=!flag;next}!flag' "$TEMPLATE_DIR/$template_file")
    
    # Create issue
    issue_url=$(gh issue create \
        --repo "$REPO" \
        --title "$title" \
        --body "$body" \
        --label "$labels")
    
    echo "✅ Created: $issue_url"
    echo ""
}

# Create umbrella issue
echo "🎯 Creating umbrella issue..."
gh issue create \
    --repo "$REPO" \
    --title "[MMO Game Feature] Massively Multiplayer Online Game - Umbrella Issue" \
    --body "# 🎮 MMO Game Feature - Umbrella Issue

## 📋 Overview
This is the umbrella issue for transforming QuizMaster into a massively multiplayer online (MMO) quiz game that supports dozens of simultaneous users with blazing-fast performance.

## 📚 Documentation
- [Complete Roadmap](https://github.com/$REPO/blob/main/.github/MMO_GAME_FEATURE_ROADMAP.md)
- [Issue Summary](https://github.com/$REPO/blob/main/.github/ISSUES_SUMMARY.md)

## 🎯 Goals
- **Speed**: Sub-100ms latency for user interactions
- **Scale**: Support 50+ concurrent players per game
- **UX**: Lightning-fast, responsive gameplay
- **Reliability**: 99.9% WebSocket connection stability

## 📊 Progress Tracking

### Phase 1: WebSocket Infrastructure (P0 - Critical)
- [ ] #TBD - Implement NestJS WebSocket Gateway
- [ ] #TBD - Refactor Game Use Cases for Real-Time Events
- [ ] #TBD - Add Connection Management & Recovery

### Phase 2: Performance & Scalability (P0-P1)
- [ ] #TBD - Add Redis Caching Layer
- [ ] #TBD - Implement Horizontal Scaling with Redis Adapter
- [ ] #TBD - Optimize WebSocket Message Payloads
- [ ] #TBD - Implement Database Query Optimization

### Phase 3: Frontend Performance & UX (P1-P2)
- [ ] #TBD - Implement Optimistic UI Updates
- [ ] #TBD - Add Client-Side Performance Optimizations
- [ ] #TBD - Enhanced Game UI/UX for Speed

### Phase 4: Security & Reliability (P0-P1)
- [ ] #TBD - Implement Rate Limiting
- [ ] #TBD - Add Input Validation & Security
- [ ] #TBD - Implement Game Integrity Checks

### Phase 5: Testing & Monitoring (P1-P2)
- [ ] #TBD - Create Load Testing Infrastructure
- [ ] #TBD - Add Real-Time Performance Monitoring
- [ ] #TBD - Implement E2E Game Testing

## 📈 Timeline
- **MVP (Phase 1)**: 2-3 weeks
- **Production-Ready (Phases 1-4)**: 4-6 weeks
- **Production-Grade (All Phases)**: 6-8 weeks

## 🎉 Success Metrics
- ✅ <100ms latency (95th percentile)
- ✅ 50+ concurrent players per game
- ✅ 99.9% uptime
- ✅ Horizontal scaling to 1000+ concurrent games

---
**Note**: This issue will be updated with sub-issue numbers as they are created." \
    --label "epic,game-feature,p0-critical" || true

echo "✅ Umbrella issue created"
echo ""

# Create Phase 1 issues
echo "⚡ Creating Phase 1 issues..."
create_issue "game-phase1-issue1.md" "[Game MMO] Implement NestJS WebSocket Gateway" "enhancement,game-feature,phase-1,p0-critical"
create_issue "game-phase1-issue2.md" "[Game MMO] Refactor Game Use Cases for Real-Time Events" "enhancement,game-feature,phase-1,p0-critical"
create_issue "game-phase1-issue3.md" "[Game MMO] Add Connection Management & Recovery" "enhancement,game-feature,phase-1,p1-high"

# Create Phase 2 issues
echo "🚀 Creating Phase 2 issues..."
create_issue "game-phase2-issue1.md" "[Game MMO] Add Redis Caching Layer" "enhancement,game-feature,phase-2,p0-critical"

echo ""
echo "======================================"
echo "✅ All issues created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review issues at: https://github.com/$REPO/issues"
echo "2. Assign team members to Phase 1 issues"
echo "3. Create remaining issue templates for Phases 2-5"
echo "4. Set up GitHub Projects board for tracking"
echo ""
echo "🎮 Let's build an amazing MMO game!"
