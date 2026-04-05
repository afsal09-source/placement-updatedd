FROM eclipse-temurin:17-jdk

WORKDIR /app

# copy only backend folder
COPY backend/ .

RUN chmod +x mvnw && ./mvnw clean install

EXPOSE 8081

CMD ["sh", "-c", "java -jar target/*.jar"]