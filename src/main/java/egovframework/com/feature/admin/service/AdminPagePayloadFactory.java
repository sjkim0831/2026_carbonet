package egovframework.com.feature.admin.service;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class AdminPagePayloadFactory {

    public Map<String, Object> create(boolean isEn, String menuCode) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("isEn", isEn);
        payload.put("menuCode", menuCode);
        return payload;
    }
}
