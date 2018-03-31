package es.upv.indigodc.service;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import com.google.common.collect.Maps;

import alien4cloud.paas.model.DeploymentStatus;
import alien4cloud.paas.model.PaaSTopologyDeploymentContext;
import es.upv.indigodc.service.model.AlienDeploymentMapping;
import es.upv.indigodc.service.model.IndigoDCDeploymentMapping;
import lombok.extern.slf4j.Slf4j;

@Service("mapping-service")
@Slf4j
public class MappingService {

  /**
   * Map marathon deployment ids, which are ephemeral, to alien deployment ids
   */
  private final Map<String, AlienDeploymentMapping> indigoDCToAlienDeploymentMap = Maps.newConcurrentMap();
  
  private final Map<String, IndigoDCDeploymentMapping> alienToIndigoDCDeploymentMap = Maps.newConcurrentMap();

  /**
   * Register a running deployment into the MappingService.
   * @param marathonDeploymentId the id of the deployment in Marathon
   * @param alienDeploymentId the id of the deployment in Alien
   * @param status The running status of the deployment, Deploying or Undeploying.
   */
  public void registerDeploymentInfo(String indigoDCDeploymentId, String alienDeploymentId, DeploymentStatus status) {
	  indigoDCToAlienDeploymentMap.put(indigoDCDeploymentId, new AlienDeploymentMapping(alienDeploymentId, status));
	  alienToIndigoDCDeploymentMap.put(alienDeploymentId, new IndigoDCDeploymentMapping(indigoDCDeploymentId, status));
  }
  
  public IndigoDCDeploymentMapping getByAlienDeploymentId(String alienDeploymentId) {
	  return alienToIndigoDCDeploymentMap.get(alienDeploymentId);
  }

  public void init(Collection<PaaSTopologyDeploymentContext> activeDeployments) {
	  log.info("call");
      activeDeployments.forEach(context -> {
          // Initialize a new group mapping
          final String groupId = context.getDeploymentPaaSId().toLowerCase();
          // Fill app mapping
          //registerGroupMapping(groupId, context.getDeploymentId());
//          context.getPaaSTopology().getNonNatives().forEach(nodeTemplate -> 
//          	registerAppMapping(groupId, nodeTemplate.getId().toLowerCase(), nodeTemplate.getId()));
      });
  }
}
