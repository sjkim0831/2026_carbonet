package egovframework.com.feature.member.dto.response;

import egovframework.com.feature.member.model.vo.CompanyListItemVO;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CompanySearchResponseDTO {
    private List<CompanyListItemVO> list;
    private int totalCnt;
    private int page;
    private int size;
    private int totalPages;
}
