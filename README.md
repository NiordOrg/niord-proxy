# Niord Proxy

The Niord Proxy is intended to demonstrate how an end-user facing website could retrieve and render messages from a
Niord back-end server.

Addition developer documentation is provided at http://docs.niord.org/dev-guide/guide.html#niord-proxy-development-set-up. 

## Prerequisites
* Java JDK 1.8
* Maven 3.5.x

__NOTE:__ this project does not build with Maven 3.6 or Java versions never than Java 8

### Build

Build the Niord Proxy micro service using:

    mvn clean install

### Run

The Niord Proxy can be run as an executable jar:

    java -Dniord-proxy.server=http://localhost:8080 -jar target/niord-proxy-swarm.jar

### Release Docker Image

In order to release Niord as a Docker image you will need access to https://hub.docker.com/u/dmadk

Run the following commands with the actual version replacing the version tag.

```bash
$ docker build . -t dmadk/niord-proxy:$REPLACE_WITH_VERSION_TAG$
$ docker push dmadk/niord-proxy:$REPLACE_WITH_VERSION_TAG$
```
