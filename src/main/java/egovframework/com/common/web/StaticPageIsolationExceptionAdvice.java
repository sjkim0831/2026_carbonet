package egovframework.com.common.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice(annotations = Controller.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class StaticPageIsolationExceptionAdvice {

    private static final Logger log = LoggerFactory.getLogger(StaticPageIsolationExceptionAdvice.class);

    @ExceptionHandler(Exception.class)
    public Object handlePageException(Exception ex, HttpServletRequest request) {
        String uri = request == null ? "" : request.getRequestURI();
        log.error("Page-level error isolated for uri={}", uri, ex);

        if (isApiRequest(request, uri)) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("status", "error");
            body.put("message", "페이지 처리 중 오류가 발생했습니다.");
            body.put("path", uri);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.TEXT_HTML)
                .body(buildErrorHtml(uri));
    }

    private boolean isApiRequest(HttpServletRequest request, String uri) {
        if (request != null) {
            String accept = request.getHeader("Accept");
            if (accept != null && accept.contains("application/json")) {
                return true;
            }
            String contentType = request.getContentType();
            if (contentType != null && contentType.contains("application/json")) {
                return true;
            }
            String requestedWith = request.getHeader("X-Requested-With");
            if ("XMLHttpRequest".equalsIgnoreCase(requestedWith)) {
                return true;
            }
        }
        if (uri == null) {
            return false;
        }
        return uri.startsWith("/api/")
                || uri.endsWith(".json")
                || uri.endsWith("/actionLogin")
                || uri.endsWith("/validateRefreshToken")
                || uri.endsWith("/recreateAccessToken")
                || uri.endsWith("/resetPassword")
                || uri.endsWith("/reload");
    }

    private String buildErrorHtml(String uri) {
        String safeUri = uri == null || uri.isBlank() ? "/" : escapeHtml(uri);
        return "<!DOCTYPE html><html lang=\"ko\"><head><meta charset=\"UTF-8\" />"
                + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />"
                + "<title>Page Error</title>"
                + "<style>body{margin:0;font-family:Arial,sans-serif;background:#f8fafc;color:#111827}"
                + ".wrap{max-width:760px;margin:24px auto;padding:20px}"
                + ".card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px}"
                + ".title{margin:0 0 10px;font-size:18px;font-weight:700;color:#991b1b}"
                + ".meta{margin:6px 0 0;font-size:13px;color:#4b5563}"
                + ".hint{margin-top:14px;font-size:13px;color:#1f2937}</style></head><body>"
                + "<div class=\"wrap\"><div class=\"card\"><h1 class=\"title\">Page Error</h1>"
                + "<p>요청한 페이지 처리 중 오류가 발생했습니다. 메인 화면은 계속 사용할 수 있습니다.</p>"
                + "<p class=\"meta\">Path: " + safeUri + "</p>"
                + "<p class=\"hint\">잠시 후 다시 시도하거나 다른 화면으로 이동해 주세요.</p>"
                + "</div></div></body></html>";
    }

    private String escapeHtml(String input) {
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
