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

In order to release Niord you will need access to https://hub.docker.com/u/dmadk

Replace

```bash
$ docker build . -t dmadk/niord-proxy:$REPLACE_WITH_VERSION_TAG$
$ docker push dmadk/niord-proxy:$REPLACE_WITH_VERSION_TAG$
```

You should also update the version in the Helm chart of Niord Proxy (https://github.com/NiordOrg/charts) and release a new chart.
