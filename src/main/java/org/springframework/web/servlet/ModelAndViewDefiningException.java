package org.springframework.web.servlet;

import javax.servlet.ServletException;

/**
 * Compatibility shim for legacy code paths that still reference the removed
 * Spring MVC exception type during dispatch error handling.
 */
@SuppressWarnings("serial")
public class ModelAndViewDefiningException extends ServletException {

    private final ModelAndView modelAndView;

    public ModelAndViewDefiningException(ModelAndView modelAndView) {
        super("ModelAndView defined");
        this.modelAndView = modelAndView;
    }

    public ModelAndView getModelAndView() {
        return modelAndView;
    }
}
