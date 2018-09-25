package alien4cloud.ui.form.annotation;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

/**
 * This annotation is the mirror of PropertyDefinition.
 */
@Target({ FIELD, METHOD })
@Retention(RUNTIME)
public @interface FormPropertyDefinition {

    String type();

    FormPropertyConstraint constraints() default @FormPropertyConstraint();

    boolean isRequired() default false;

    String defaultValue() default "";

    String description() default "";

    boolean isPassword() default false;
}
