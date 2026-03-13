# carbonet (Host Runtime)

## Build
```bash
cd /opt/projects/carbonet
mvn -DskipTests package
```

## Run
```bash
cd /opt/projects/carbonet
java -jar target/carbonet.jar
```

## Notes
- This app runs carbonet only (no Eureka/Config/Gateway).
- DB host default is `localhost` (`${CUBRID_HOST:localhost}`).
- If needed, change DB settings in `src/main/resources/application.yml`.
