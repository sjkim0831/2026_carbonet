package egovframework.com.platform.screenbuilder.support;

import javax.servlet.http.HttpServletRequest;
import java.util.Locale;

public interface ScreenBuilderRequestContextPolicyPort {

    boolean isEnglishRequest(HttpServletRequest request, Locale locale);
}
