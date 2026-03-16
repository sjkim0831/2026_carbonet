FROM eclipse-temurin:17-jre

WORKDIR /app

COPY target/carbonet.jar /app/carbonet.jar

RUN mkdir -p /app/var/logs /app/var/run /app/var/file

ENV SERVER_PORT=18000
ENV CUBRID_HOST=host.docker.internal
ENV CUBRID_PORT=33000
ENV CUBRID_DB=carbonet
ENV CUBRID_USER=dba
ENV CUBRID_PASSWORD=

EXPOSE 18000

ENTRYPOINT ["java", "-jar", "/app/carbonet.jar"]
