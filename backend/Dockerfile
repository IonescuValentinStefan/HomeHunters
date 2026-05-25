FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy the built JAR file
COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
