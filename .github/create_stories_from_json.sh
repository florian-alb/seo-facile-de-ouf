#!/usr/bin/env bash
set -euo pipefail

REPO="florian-alb/seo-facile-de-ouf"
JSON_FILE=".github/issues.json"

# ⚠️ Nécessaire pour manipuler Projects: token avec scope "project"
# Si erreur: gh auth refresh -s project
# (docs GH CLI)
# :contentReference[oaicite:2]{index=2}

EPIC=$(jq -r '.epic' "$JSON_FILE")
LABELS=$(jq -r '.default_labels | join(",")' "$JSON_FILE")

PROJECT_OWNER=$(jq -r '.project.owner' "$JSON_FILE")
PROJECT_NUMBER=$(jq -r '.project.number' "$JSON_FILE")

jq -c '.stories[]' "$JSON_FILE" | while read -r story; do
  TITLE=$(echo "$story" | jq -r '.title')
  SP=$(echo "$story" | jq -r '.story_points')
  AREA=$(echo "$story" | jq -r '.area')
  PRIORITY=$(echo "$story" | jq -r '.priority')

  BODY=$(cat <<EOF
## 📌 Epic liée
- Epic : ${EPIC}

## 🧩 User story
À compléter.

## 🛠️ Notes techniques
- Area : ${AREA}
- Priority : ${PRIORITY}
- Story Points : ${SP}
EOF
)

  echo "🚀 Creating issue: $TITLE"

  # gh issue create affiche l'URL de l'issue créée dans stdout (on l'extrait proprement)
  ISSUE_URL=$(
    gh issue create \
      --repo "$REPO" \
      --title "$TITLE" \
      --body "$BODY" \
      --label "$LABELS" \
      --assignee "@me" \
    | grep -Eo 'https://github\.com/[^ ]+' | tail -n 1
  )

  if [[ -z "${ISSUE_URL:-}" ]]; then
    echo "❌ Impossible de récupérer l'URL de l'issue créée (titre: $TITLE)"
    exit 1
  fi

  echo "➕ Adding to project: owner=$PROJECT_OWNER number=$PROJECT_NUMBER"
  gh project item-add "$PROJECT_NUMBER" \
    --owner "$PROJECT_OWNER" \
    --url "$ISSUE_URL" \
    >/dev/null

  echo "✅ Created + added: $ISSUE_URL"
done
