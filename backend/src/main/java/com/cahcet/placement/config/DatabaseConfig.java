package com.cahcet.placement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        String finalUrl = dbUrl;
        String finalUser = username;
        String finalPass = password;

        if (finalUrl != null && finalUrl.startsWith("mysql://")) {
            try {
                URI uri = new URI(finalUrl);
                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    finalUser = userInfo[0];
                    if (userInfo.length > 1) {
                        finalPass = userInfo[1];
                    }
                }
                
                // Construct the valid JDBC URL without the user info
                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 3306;
                String path = uri.getPath();
                String query = uri.getQuery();
                
                finalUrl = "jdbc:mysql://" + host + ":" + port + path;
                if (query != null && !query.isEmpty()) {
                    finalUrl += "?" + query + "&socketTimeout=30000&connectTimeout=10000";
                } else {
                    finalUrl += "?socketTimeout=30000&connectTimeout=10000";
                }
            } catch (Exception e) {
                // Ignore parsing errors and fallback
                finalUrl = "jdbc:" + finalUrl;
            }
        } else if (finalUrl != null && !finalUrl.startsWith("jdbc:")) {
             finalUrl = "jdbc:" + finalUrl;
        }

        return DataSourceBuilder.create()
                .url(finalUrl)
                .username(finalUser)
                .password(finalPass)
                .driverClassName(driverClassName)
                .build();
    }
}
