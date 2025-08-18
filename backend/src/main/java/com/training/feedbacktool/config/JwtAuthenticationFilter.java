package com.training.feedbacktool.config;import com.training.feedbacktool.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;import java.io.IOException;
import java.util.List;@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {    private final JwtUtil jwtUtil;    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
    this.jwtUtil = jwtUtil;
}    @Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {        final String authorizationHeader = request.getHeader("Authorization");        String email = null;
    String jwt = null;        // Extract JWT from Authorization header
    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
        jwt = authorizationHeader.substring(7);
        try {
            email = jwtUtil.extractEmail(jwt);
        } catch (Exception e) {
            // Invalid token - let it pass through, will be handled by security config
            logger.warn("Invalid JWT token: " + e.getMessage());
        }
    }        // If we have a valid email and no existing authentication
    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        try {
            // Validate the token
            if (!jwtUtil.isTokenExpired(jwt)) {
                // Extract role from token
                String role = jwtUtil.extractRole(jwt);
                Long userId = jwtUtil.extractUserId(jwt);                    // Create authorities (Spring Security expects "ROLE_" prefix)
                List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + role)
                );                    // Create authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));                    // Set the authentication in the security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            logger.warn("JWT authentication failed: " + e.getMessage());
        }
    }        filterChain.doFilter(request, response);
}
}
