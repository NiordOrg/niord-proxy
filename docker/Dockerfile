FROM java:openjdk-8-jdk

ADD niord-proxy-swarm.jar /opt/niord-proxy-swarm.jar

# TODO: Resolve logging in wildfly swarm
# See https://groups.google.com/forum/#!topic/wildfly-swarm/nQCHhWSaEuY

EXPOSE 8080
ENTRYPOINT ["java", "-Djboss.server.log.dir=/var/log", "-jar", "/opt/niord-proxy-swarm.jar"]
