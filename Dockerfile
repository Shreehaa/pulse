FROM eclipse-temurin:21-jdk

RUN groupadd --system pulse && \
    useradd --system --gid pulse pulse

WORKDIR /app

COPY target/pulse-0.0.1-SNAPSHOT.jar app.jar

RUN chown -R pulse:pulse /app

USER pulse

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]