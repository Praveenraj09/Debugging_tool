package com.ocient.config;
import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import org.springframework.http.converter.HttpMessageConverter;
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.add(new FormHttpMessageConverter());
    }
}
