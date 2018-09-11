package alien4cloud.paas.policies;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AllocationError {

    private AllocationErrorCode code;

    private String groupId;

    private String nodeId;
}
