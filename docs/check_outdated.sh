#!/bin/bash

# This script takes `locale` as a param and checks if a specific locale version of document is up to date with English version
# If latest commit timestamp of English version is greater than the specific locale version,
# The specific locale version document will be marked as outdated

set -xe

SED_INPLACE() {
  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

locale="$1"
cur_path=`pwd`
cd .tmp/upstream-docs

for file in `find ./docs/content -name "*.${locale}.md"`; do
    file_en="${file/.${locale}/.en-us}"
    if [ ! -f "$file_en" ]; then
        continue
    fi
    latest_commit_time_en=$(git log -1 --format=%ct "$file_en")
    latest_commit_time_locale=$(git log -1 --format=%ct "$file")
    if [ -z "$latest_commit_time_locale" ]; then
        continue
    fi
    if [[ "$latest_commit_time_en" -gt "$latest_commit_time_locale" ]]; then
        echo "file: $file, lastest commit timestamp: $latest_commit_time_en (en ver), $latest_commit_time_locale ($locale ver)"
        SED_INPLACE '1s/---/---\nisOutdated: true/' $file
    fi
done

cd "$cur_path"
