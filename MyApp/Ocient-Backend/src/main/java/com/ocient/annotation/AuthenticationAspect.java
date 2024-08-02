package com.ocient.annotation;

import com.okta.jwt.AccessTokenVerifier;
import com.okta.jwt.Jwt;
import com.okta.jwt.JwtVerificationException;
import com.okta.jwt.JwtVerifiers;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.servlet.http.HttpServletRequest;

@Aspect
@Component
public class AuthenticationAspect {

    private final HttpServletRequest request;

    private static final AccessTokenVerifier jwtVerifier = JwtVerifiers.accessTokenVerifierBuilder()
            .setIssuer("https://dev-92455550.okta.com/oauth2/default") // Replace with your Okta domain
            .build();

    public AuthenticationAspect(HttpServletRequest request) {
        this.request = request;
    }

    public static boolean hasSubClaim(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return false;
        }
        token = token.substring(7);  
        try {
            Jwt jwt = jwtVerifier.decode(token);
            return jwt.getClaims().containsKey("sub");
        } catch (JwtVerificationException e) {
            // Handle invalid token
            return false;
        }
    }

    @Pointcut("@annotation(com.ocient.annotation.IsAuthenticated)")
    public void isAuthenticated() {
    }

    @Before("isAuthenticated()")
    public void checkAuthentication() {
        String token = request.getHeader("Authorization");
        if (!hasSubClaim(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token or 'sub' claim missing");
        }
    }
}
