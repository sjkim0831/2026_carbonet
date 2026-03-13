package egovframework.com.feature.auth.util;

import egovframework.com.feature.auth.dto.response.LoginResponseDTO;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.egovframe.boot.crypto.service.impl.EgovEnvCryptoServiceImpl;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseCookie;
import org.springframework.util.ObjectUtils;

import javax.crypto.SecretKey;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

@Configuration
@Getter
public class JwtTokenProvider {

    @Value("${token.accessSecret}")
    private String accessSecret;

    @Value("${token.refreshSecret}")
    private String refreshSecret;

    @Value("${token.accessExpiration}")
    private String accessExpiration;

    @Value("${token.refreshExpiration}")
    private String refreshExpiration;

    private final EgovEnvCryptoServiceImpl egovEnvCryptoService;

    public JwtTokenProvider(@Qualifier("egovEnvCryptoService") EgovEnvCryptoServiceImpl egovEnvCryptoService) {
        this.egovEnvCryptoService = egovEnvCryptoService;
    }

    public SecretKey getSigningKey(String secret) {
        if (ObjectUtils.isEmpty(secret)) {
            throw new IllegalArgumentException("JWT secret must not be empty");
        }

        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        } catch (Exception ignored) {
            // fall through
        }

        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(secret));
        } catch (Exception ignored) {
            // fall through
        }

        // Plain text secret fallback: derive a stable 256-bit key.
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm is not available", e);
        }
    }

    public String createAccessToken(LoginResponseDTO loginVO) {
        SecretKey key = getSigningKey(accessSecret);
        Claims claims = createClaims(loginVO, accessExpiration);
        return Jwts.builder().claims(claims).signWith(key).compact();
    }

    public String createRefreshToken(LoginResponseDTO loginVO) {
        SecretKey key = getSigningKey(refreshSecret);
        Claims claims = createClaims(loginVO, refreshExpiration);
        return Jwts.builder().claims(claims).signWith(key).compact();
    }

    public Claims createClaims(LoginResponseDTO loginVO, String expiration) {
        ClaimsBuilder builder = Jwts.claims()
                .subject("Token")
                .add("userId", ObjectUtils.isEmpty(loginVO.getUserId()) ? "" : encrypt(loginVO.getUserId()))
                .add("userNm", ObjectUtils.isEmpty(loginVO.getName()) ? "" : encrypt(loginVO.getName()))
                .add("uniqId", ObjectUtils.isEmpty(loginVO.getUniqId()) ? "" : encrypt(loginVO.getUniqId()))
                .add("authLs", ObjectUtils.isEmpty(loginVO.getAuthorList()) ? "" : encrypt(loginVO.getAuthorList()))
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + Long.parseLong(expiration)));

        return builder.build();
    }

    public int accessValidateToken(String token) {
        try {
            accessExtractClaims(token);
            return 200;
        } catch (MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            return 400;
        } catch (ExpiredJwtException e) {
            return 401;
        }
    }

    public int refreshValidateToken(String token) {
        try {
            refreshExtractClaims(token);
            return 200;
        } catch (MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            return 400;
        } catch (ExpiredJwtException e) {
            return 401;
        }
    }

    public Claims accessExtractClaims(String token) {
        SecretKey key = getSigningKey(accessSecret);
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public Claims refreshExtractClaims(String token) {
        SecretKey key = getSigningKey(refreshSecret);
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public String extractUserId(String token) {
        return ObjectUtils.isEmpty(refreshExtractClaims(token).get("userId")) ?
                "" : refreshExtractClaims(token).get("userId").toString();
    }

    public String extractUserNm(String token) {
        return ObjectUtils.isEmpty(refreshExtractClaims(token).get("userNm")) ?
                "" : refreshExtractClaims(token).get("userNm").toString();
    }

    public String extractUniqId(String token) {
        return ObjectUtils.isEmpty(refreshExtractClaims(token).get("uniqId")) ?
                "" : refreshExtractClaims(token).get("uniqId").toString();
    }

    public String extractAuthId(String token) {
        return ObjectUtils.isEmpty(refreshExtractClaims(token).get("authId")) ?
                "" : refreshExtractClaims(token).get("authId").toString();
    }

    public String extractAuthorList(String token) {
        return ObjectUtils.isEmpty(refreshExtractClaims(token).get("authLs")) ?
                "" : refreshExtractClaims(token).get("authLs").toString();
    }

    public String encrypt(String s) {
        return egovEnvCryptoService.encrypt(s);
    }

    public String decrypt(String s) {
        return egovEnvCryptoService.decrypt(s);
    }

    public ResponseCookie createCookie(String tokenName, String tokenValue, long tokenMaxAge) {
        return ResponseCookie.from(tokenName, tokenValue)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(tokenMaxAge + 10)
                .sameSite("Strict")
                .build();
    }

    public String getCookie(HttpServletRequest request, String cookieName) {
        String cookieValue = "";
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    cookieValue = cookie.getValue();
                }
            }
        }
        return cookieValue;
    }

    public void deleteCookie(HttpServletRequest request, HttpServletResponse response, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(cookieName)) {
                    cookie.setValue("");
                    cookie.setPath("/");
                    cookie.setMaxAge(0);
                    response.addCookie(cookie);
                }
            }
        }
    }

}
