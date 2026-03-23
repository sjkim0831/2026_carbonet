package egovframework.com.framework.authority.web;

import egovframework.com.framework.authority.model.FrameworkAuthorityContractVO;
import egovframework.com.framework.authority.service.FrameworkAuthorityContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping({"/admin", "/en/admin"})
@RequiredArgsConstructor
public class FrameworkAuthorityContractController {

    private final FrameworkAuthorityContractService frameworkAuthorityContractService;

    @GetMapping("/api/admin/framework/authority-contract")
    @ResponseBody
    public ResponseEntity<FrameworkAuthorityContractVO> getFrameworkAuthorityContract() throws Exception {
        return ResponseEntity.ok(frameworkAuthorityContractService.getAuthorityContract());
    }
}

