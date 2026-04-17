# Carbonet Multi-Project Runtime Platform Makefile
# Usage: make [target] project=[PROJECT_ID]

project ?= p003
port ?= 18000
remote ?= carbonet2026@136.117.100.221

.PHONY: help new-project build build-all deploy local-docker db-create rollback cleanup status

help:
	@echo "Carbonet Independent Runtime Management Commands:"
	@echo "--------------------------------------------------------"
	@echo "make new-project project=p004      : Scaffold a new project from template"
	@echo "make db-create project=p004        : Create a new CUBRID DB for the project"
	@echo "make build project=p003            : Assemble release package for a project"
	@echo "make build-all                     : Assemble all projects"
	@echo "make local-docker project=p003     : Run project locally in Docker"
	@echo "make deploy project=p003           : Deploy to remote server"
	@echo "make rollback project=p003         : Rollback to previous version on server"
	@echo "make cleanup project=p003          : Remove old releases from server"
	@echo "make status                        : Show status of all runtimes on server"
	@echo "--------------------------------------------------------"

new-project:
	bash ops/scripts/create-new-project.sh $(project)

db-create:
	bash ops/scripts/create-project-cubrid-db.sh $(project)

build:
	bash ops/scripts/assemble-project-release.sh $(project)

build-all:
	bash ops/scripts/assemble-all-releases.sh

local-docker:
	bash ops/scripts/run-local-docker.sh $(project) $(port)

deploy:
	bash ops/scripts/deploy-project-release.sh $(project) $(port) $(remote)

rollback:
	bash ops/scripts/rollback-project-release.sh $(project) $(remote)

cleanup:
	bash ops/scripts/cleanup-old-releases.sh $(project) 5 $(remote)

status:
	bash ops/scripts/show-project-runtimes-status.sh $(remote)
