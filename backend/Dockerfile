FROM eclipse-temurin:17-jdk

WORKDIR /app

# install unzip (IMPORTANT FIX)
RUN apt-get update && apt-get install -y unzip

COPY . .

RUN chmod +x mvnw && ./mvnw clean install

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/*.jar"]
