package egovframework.com.feature.home.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class ReactMigrationAssetResolver {

    private static final String MANIFEST_RESOURCE = "classpath:/static/react-migration/.vite/manifest.json";
    private static final String ENTRY_KEY = "src/main.tsx";
    private static final String FALLBACK_ENTRY_KEY = "index.html";

    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;
    private final String fallbackJs;
    private final String fallbackCss;

    public ReactMigrationAssetResolver(
            ObjectMapper objectMapper,
            ResourceLoader resourceLoader,
            @Value("${carbonet.react-migration.prod-js:/react-migration/assets/index.js}") String fallbackJs,
            @Value("${carbonet.react-migration.prod-css:/react-migration/assets/index.css}") String fallbackCss) {
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
        this.fallbackJs = fallbackJs;
        this.fallbackCss = fallbackCss;
    }

    public ReactMigrationAssets resolveAssets() {
        Resource manifestResource = resourceLoader.getResource(MANIFEST_RESOURCE);
        if (!manifestResource.exists()) {
            return new ReactMigrationAssets(fallbackJs, fallbackCss);
        }

        try (InputStream inputStream = manifestResource.getInputStream()) {
            Map<String, ManifestEntry> manifest = objectMapper.readValue(inputStream, new TypeReference<Map<String, ManifestEntry>>() {
            });
            ManifestEntry entry = manifest.get(ENTRY_KEY);
            if (entry == null) {
                entry = manifest.get(FALLBACK_ENTRY_KEY);
            }
            if (entry == null || isBlank(entry.getFile())) {
                return new ReactMigrationAssets(fallbackJs, fallbackCss);
            }

            String jsPath = toPublicAssetPath(entry.getFile());
            String cssPath = firstCssPath(entry.getCss());
            return new ReactMigrationAssets(jsPath, cssPath == null ? fallbackCss : cssPath);
        } catch (IOException ex) {
            return new ReactMigrationAssets(fallbackJs, fallbackCss);
        }
    }

    private String firstCssPath(List<String> cssFiles) {
        if (cssFiles == null || cssFiles.isEmpty() || isBlank(cssFiles.get(0))) {
            return null;
        }
        return toPublicAssetPath(cssFiles.get(0));
    }

    private String toPublicAssetPath(String relativePath) {
        String normalized = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
        return "/react-migration/" + normalized;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public static class ReactMigrationAssets {
        private final String jsPath;
        private final String cssPath;

        public ReactMigrationAssets(String jsPath, String cssPath) {
            this.jsPath = jsPath;
            this.cssPath = cssPath;
        }

        public String getJsPath() {
            return jsPath;
        }

        public String getCssPath() {
            return cssPath;
        }
    }

    public static class ManifestEntry {
        private String file;
        private List<String> css = Collections.emptyList();

        public String getFile() {
            return file;
        }

        public void setFile(String file) {
            this.file = file;
        }

        public List<String> getCss() {
            return css;
        }

        public void setCss(List<String> css) {
            this.css = css;
        }
    }
}
