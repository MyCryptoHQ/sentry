
FROM node:8.9.4-stretch

#install dependencies
RUN apt-get update && apt-get install -y \
    python-pip \ 
    wget \ 
    diffutils
RUN pip install Pygments

#copy source code
COPY src ~/sentryApp

WORKDIR ~/sentryApp

ENV IS_DOCKER_CONTAINER=true

