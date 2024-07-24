package com.ocient.config;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnection {

    @Autowired
    private Environment env;

    public Connection getConnection() throws SQLException {
        String url = env.getProperty("spring.datasource.url");
        String username = env.getProperty("spring.datasource.username");
        String password = env.getProperty("spring.datasource.password");

        Connection connection = DriverManager.getConnection(url, username, password);
        return connection;
    }
}