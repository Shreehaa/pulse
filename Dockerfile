# Build stage
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn -B clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

RUN groupadd --system pulse && \
    useradd --system --gid pulse pulse

WORKDIR /app

COPY --from=builder /build/target/pulse-0.0.1-SNAPSHOT.jar app.jar

RUN mkdir -p /app/data/job-results && \
    chown -R pulse:pulse /app

USER pulse

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]