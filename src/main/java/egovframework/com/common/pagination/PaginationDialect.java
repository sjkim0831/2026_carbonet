package egovframework.com.common.pagination;

import org.thymeleaf.context.IExpressionContext;
import org.thymeleaf.dialect.AbstractDialect;
import org.thymeleaf.dialect.IExpressionObjectDialect;
import org.thymeleaf.expression.IExpressionObjectFactory;

import java.util.Collections;
import java.util.Set;

public class PaginationDialect extends AbstractDialect implements IExpressionObjectDialect {

    public PaginationDialect() {
        super("PaginationDialect");
    }

    @Override
    public IExpressionObjectFactory getExpressionObjectFactory() {
        return new IExpressionObjectFactory() {
            @Override
            public Set<String> getAllExpressionObjectNames() {
                return Collections.singleton("egovPaginationFormat");
            }

            @Override
            public Object buildObject(IExpressionContext context, String expressionObjectName) {
                return new PaginationFormat();
            }

            @Override
            public boolean isCacheable(String expressionObjectName) {
                return true;
            }
        };
    }

}
