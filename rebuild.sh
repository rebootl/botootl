#!/bin/bash
#
docker build -t botootl .
docker stop botootl
docker rm botootl
docker run --name botootl -d --restart unless-stopped botootl
