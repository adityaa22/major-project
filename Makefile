.PHONY: start stop up

up:
	docker-compose up -d $(n)

bst:
	make up n="bootstrap"
	sleep 2

nodes:
	make up n="node1"
	sleep 2
	make up n="node2"
	sleep 2

primary:
	make up n="pr-node"
	sleep 2

backup:
	make up n="bkp-node1"
	sleep 2
	make up n="bkp-node2"
	sleep 2
	make up n="bkp-node3"
	sleep 2

start:
	make bst
	make primary
	make backup
	make nodes

stop:
	docker-compose down -t0
	rm -rf server-settings/*
