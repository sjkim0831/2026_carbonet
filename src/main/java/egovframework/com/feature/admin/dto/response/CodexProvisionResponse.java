package egovframework.com.feature.admin.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CodexProvisionResponse {

    private String status;
    private String requestId;
    private String actorId;
    private String logId;
    private String inspectionStatus;
    private boolean securityMetadataReloaded;
    private int createdCount;
    private int existingCount;
    private int skippedCount;
    private List<String> issues = new ArrayList<>();
    private List<ResultItem> results = new ArrayList<>();

    public void addResult(String category, String key, String status, String message) {
        ResultItem item = new ResultItem();
        item.setCategory(category);
        item.setKey(key);
        item.setStatus(status);
        item.setMessage(message);
        results.add(item);
        if ("CREATED".equals(status)) {
            createdCount++;
        } else if ("EXISTING".equals(status)) {
            existingCount++;
        } else {
            skippedCount++;
        }
    }

    @Getter
    @Setter
    public static class ResultItem {
        private String category;
        private String key;
        private String status;
        private String message;
    }
}
