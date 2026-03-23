package egovframework.com.common.logging;

import java.util.Collections;
import java.util.List;
import lombok.Getter;

@Getter
public class RequestExecutionLogPage {

    private final List<RequestExecutionLogVO> items;
    private final int totalCount;

    public RequestExecutionLogPage(List<RequestExecutionLogVO> items, int totalCount) {
        this.items = items == null ? Collections.emptyList() : items;
        this.totalCount = Math.max(totalCount, 0);
    }
}
