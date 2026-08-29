#!/bin/bash
#
# Regenerates the api definitions served by this site: the swagger 2.0 document
# every gitea version ships, and the openapi 3.0 document gitea generates since
# 1.27.
#
# Usage: ./update_api_docs.sh [--latest-only] [sed -i suffix] [extra sed args...]
#
#   --latest-only   only refresh static/swagger-latest.json and
#                   static/openapi3-latest.json from gitea main, leaving the
#                   released documents untouched.

set -euo pipefail

LATEST_ONLY=0
if [ "${1:-}" = "--latest-only" ]; then
  LATEST_ONLY=1
  shift
fi

SED_INPLACE=(-i)
EXTRA_SED_ARGS=()

if [ "$#" -gt 0 ]; then
  SED_INPLACE=(-i "$1")
  shift
else
  if sed --version >/dev/null 2>&1; then
    SED_INPLACE=(-i)
  else
    SED_INPLACE=(-i '')
  fi
fi

EXTRA_SED_ARGS=("$@")

inplace_sed() {
  # ${arr[@]+...} keeps `set -u` happy with empty arrays on bash 3.2 (macOS)
  sed "${SED_INPLACE[@]}" ${EXTRA_SED_ARGS[@]+"${EXTRA_SED_ARGS[@]}"} "$@"
}

# gitea >= 1.28 ships a pre-generated json, older versions ship a go template
SWAGGER_PATHS=(
  'templates/swagger/v1-swagger.generated.json'
  'templates/swagger/v1_json.tmpl'
)

# the openapi 3.0 document exists since gitea 1.27, with the same split between
# a pre-generated json and a go template
OPENAPI3_PATHS=(
  'templates/swagger/v1-openapi3.generated.json'
  'templates/swagger/v1_openapi3_json.tmpl'
)

# download_swagger <git ref> <output file>
download_swagger() {
  local ref="$1" output="$2" path
  for path in "${SWAGGER_PATHS[@]}"; do
    if curl --silent --fail --location --output "$output" \
        "https://raw.githubusercontent.com/go-gitea/gitea/${ref}/${path}"; then
      return 0
    fi
  done
  echo "unable to download the swagger definition of ${ref}" >&2
  return 1
}

# download_openapi3 <git ref> <output file>, returns 1 for a version without one
download_openapi3() {
  local ref="$1" output="$2" path
  for path in "${OPENAPI3_PATHS[@]}"; do
    if curl --silent --fail --location --output "$output" \
        "https://raw.githubusercontent.com/go-gitea/gitea/${ref}/${path}"; then
      return 0
    fi
  done
  return 1
}

# rewrite_swagger <file> <version to display>
rewrite_swagger() {
  local file="$1" version="$2"
  # gitea >= 1.28
  inplace_sed "s|\"version\": \"0.0.0+GITEA-API-APP-VERSION\"|\"version\": \"${version}\"|" "$file"
  inplace_sed 's|"basePath": "/GITEA-API-APP-SUBURL/api/v1"|"basePath": "https://gitea.com/api/v1"|' "$file"
  # gitea >= 1.24
  inplace_sed "s|\"version\": \"{{.SwaggerAppVer}}\"|\"version\": \"${version}\"|" "$file"
  inplace_sed 's|"basePath": "{{.SwaggerAppSubUrl}}/api/v1"|"basePath": "https://gitea.com/api/v1"|' "$file"
  # gitea < 1.24
  inplace_sed "s|\"version\": \"{{AppVer \| JSEscape}}\"|\"version\": \"${version}\"|" "$file"
  inplace_sed "s#\"basePath\": \"{{AppSubUrl | JSEscape}}/api/v1\"#\"basePath\": \"https://gitea.com/api/v1\"#" "$file"
}

# rewrite_openapi3 <file> <version to display>, the placeholders sit in `servers`
# instead of `basePath`
rewrite_openapi3() {
  local file="$1" version="$2"
  # gitea >= 1.28
  inplace_sed "s|\"version\": \"0.0.0+GITEA-API-APP-VERSION\"|\"version\": \"${version}\"|" "$file"
  inplace_sed 's|"url": "/GITEA-API-APP-SUBURL/api/v1"|"url": "https://gitea.com/api/v1"|' "$file"
  # gitea 1.27
  inplace_sed "s|\"version\": \"{{.SwaggerAppVer}}\"|\"version\": \"${version}\"|" "$file"
  inplace_sed 's|"url": "{{.SwaggerAppSubUrl}}/api/v1"|"url": "https://gitea.com/api/v1"|' "$file"
}

# update_version <git ref> <version to display> <suffix of the static files>
update_version() {
  local ref="$1" version="$2" suffix="$3"

  download_swagger "$ref" v1_json.tmpl
  rewrite_swagger v1_json.tmpl "$version"
  mv v1_json.tmpl "static/swagger-${suffix}.json"

  if download_openapi3 "$ref" v1_openapi3_json.tmpl; then
    rewrite_openapi3 v1_openapi3_json.tmpl "$version"
    mv v1_openapi3_json.tmpl "static/openapi3-${suffix}.json"
  else
    # gitea < 1.27 only has the swagger 2.0 document
    rm -f v1_openapi3_json.tmpl
    echo "no openapi 3.0 document in ${ref}, keeping the swagger 2.0 one only" >&2
  fi
}

update_version 'refs/heads/main' 'dev' 'latest'

if [ "$LATEST_ONLY" -eq 1 ]; then
  exit 0
fi

for ver in '1.27.2' '1.26.4' '1.25.5' '1.24.7' '1.23.8' '1.22.6'; do
  minor=$(echo "$ver" | cut -d '.' -f 2)
  update_version "refs/tags/v${ver}" "${ver}" "${minor}"
done
