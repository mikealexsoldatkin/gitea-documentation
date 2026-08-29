GITEA_AWESOME_REMOTE := https://gitea.com/gitea/awesome-gitea.git
GITEA_AWESOME_BRANCH := main

.PHONY: all
all: build

.PHONY: create_dir
create_dir:
	mkdir -p .tmp

.PHONY: clone_awesome
clone_awesome: create_dir
	git clone --branch=$(GITEA_AWESOME_BRANCH) $(GITEA_AWESOME_REMOTE) .tmp/upstream-awesome || true

.PHONY: prepare-awesome-latest
prepare-awesome-latest: clone_awesome
	cp .tmp/upstream-awesome/README.md docs/awesome.md

.PHONY: prepare-awesome\#%
prepare-awesome\#%:
	cp .tmp/upstream-awesome/README.md  versioned_docs/version-1.$*/awesome.md

.PHONY: install
install:
	pnpm install

.PHONY: prepare-docs
prepare-docs: install prepare-awesome-latest prepare-awesome\#22 prepare-awesome\#23 prepare-awesome\#24 prepare-awesome\#25 prepare-awesome\#26 prepare-awesome\#27

.PHONY: build
build:
	pnpm run build

# type checks the astro site and its components
.PHONY: check
check:
	pnpm run check

.PHONY: serve
serve: prepare-docs
	pnpm run dev

# only the english docs of the version served at the root, plus the runner:
# starts in a few seconds instead of loading the whole matrix
.PHONY: serve-fast
serve-fast:
	pnpm run dev:en-latest

# search is built by pagefind at build time, so it is only available on the
# built site; this serves it locally
.PHONY: serve-built
serve-built: build
	pnpm run preview

.PHONY: clean
clean:
	rm -rf .tmp
	rm -rf sites/docs/dist
	rm -rf sites/docs/.cache
	rm -rf sites/docs/node_modules/.astro

# static/swagger-*.json and static/openapi3-*.json are committed files, use
# update-api-docs to refresh them
.PHONY: update-api-docs
update-api-docs:
	./update_api_docs.sh

# only refresh the documents of the gitea main branch (used by the cron job)
.PHONY: update-api-docs-latest
update-api-docs-latest:
	./update_api_docs.sh --latest-only

# regenerate the generated runner reference pages of the develop docs from the
# main branch of gitea/runner (used by the update runner reference cron job)
.PHONY: update-runner-docs
update-runner-docs:
	./update_runner_docs.sh main runner-docs/reference

# same, for every documented release series: the tags are looked up through the
# Gitea API, so a runner release needs no change here
.PHONY: update-runner-docs-released
update-runner-docs-released:
	./update_runner_docs.sh --released

# freezes the current docs or runner tree as a new version, see
# scripts/cut-version.mjs
.PHONY: cut-version
cut-version:
	@test -n "$(PRODUCT)" -a -n "$(VERSION)" || { echo 'usage: make cut-version PRODUCT=docs VERSION=1.28'; exit 1; }
	node scripts/cut-version.mjs $(PRODUCT) $(VERSION)
