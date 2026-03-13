package egovframework.com.common.logging;

import java.util.List;

public interface RequestExecutionLogService {

    void append(RequestExecutionLogVO item);

    List<RequestExecutionLogVO> readRecent(int limit);
}
