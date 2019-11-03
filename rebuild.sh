#!/bin/bash
#
docker build -t botootl .
docker stop botootl-run
docker rm botootl-run
docker run --name botootl-run -d --restart always botootl
