yodameme:
	docker build -t yodameme .

yodamemeize:
	docker run -p 10000:8000 -d yodameme

nuke:
	-docker stop `docker ps -aq`
	-docker rm -fv `docker ps -aq`
	-docker images -q --filter "dangling=true" | xargs docker rmi

.PHONY: nuke