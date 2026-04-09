package egovframework.com.feature.admin.screenbuilder.support;

import egovframework.com.framework.authority.model.FrameworkAuthorityRoleContractVO;

import java.util.List;

public interface CarbonetScreenBuilderAuthoritySource {

    List<FrameworkAuthorityRoleContractVO> getAuthorityRoles() throws Exception;
}
