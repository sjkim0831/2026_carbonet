package egovframework.com.feature.admin.service.impl;

final class VariableSectionDefinition {
    final String id;
    final String title;
    final String description;
    final String formula;

    VariableSectionDefinition(String id, String title, String description, String formula) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.formula = formula;
    }
}
