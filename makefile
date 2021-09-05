
deploy: push
	@[ -e .deploymentId ] && clasp deploy -i `cat .deploymentId` || clasp deploy;
	@make deploymentId

deploymentId:
	@[ ! -e .deploymentId ] && clasp deployments | tail -1 | sed -n 's/- \([^ ]*\).*/\1/p' > .deploymentId || true

push: create
	@clasp push

create:
	@[ ! -e .clasp.json ] && (rm -f .deploymentId && clasp create --type standalone)  || true