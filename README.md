# Niord Proxy #

The Niord Proxy is intended to demonstrate how an end-user facing website could retrieve and render messages from a
Niord back-end server.


## Prerequisites
* Java JDK 1.8
* Maven 3.x

### Build

Build the Niord Proxy micro service using:

    mvn clean install

### Run

The Niord Proxy can be run as an executable jar:

    java -Dniord-proxy.server=http://localhost:8080 -jar target/niord-proxy-swarm.jar

