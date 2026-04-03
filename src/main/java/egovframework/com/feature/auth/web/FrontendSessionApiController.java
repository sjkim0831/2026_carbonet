package egovframework.com.feature.auth.web;

import egovframework.com.feature.auth.dto.response.FrontendSessionResponseDTO;
import egovframework.com.feature.auth.service.FrontendSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
@RestController
@RequestMapping("/api/frontend")
@RequiredArgsConstructor
public class FrontendSessionApiController {
    private final FrontendSessionService frontendSessionService;

    @GetMapping("/session")
    @ResponseBody
    public FrontendSessionResponseDTO session(HttpServletRequest request, HttpServletResponse response) {
        return frontendSessionService.buildSession(request, response);
    }
}
