#!/bin/bash
#
docker build -t yutuvoice .
docker stop yutuvoice-run
docker rm yutuvoice-run
docker run --name yutuvoice-run -d --restart always yutuvoice
