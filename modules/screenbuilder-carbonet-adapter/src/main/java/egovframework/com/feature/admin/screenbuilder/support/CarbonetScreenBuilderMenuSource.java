package egovframework.com.feature.admin.screenbuilder.support;

import egovframework.com.feature.admin.screenbuilder.support.model.CarbonetScreenBuilderMenuItem;

import java.util.List;

public interface CarbonetScreenBuilderMenuSource {

    List<CarbonetScreenBuilderMenuItem> selectMenuTreeList(String codeId) throws Exception;
}
