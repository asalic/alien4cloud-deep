package alien4cloud.rest.orchestrator.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.validator.constraints.NotBlank;

@Getter
@Setter
@ApiModel("Request to update a location resource template property.")
public class UpdateLocationResourceTemplatePropertyRequest {
    @NotBlank
    @ApiModelProperty(value = "Name of the property to update.")
    private String propertyName;
    @ApiModelProperty(value = "Value of the property to update, the type must be equal to the type of the property that will be updated.")
    private Object propertyValue;
}
