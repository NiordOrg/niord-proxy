package org.niord.proxy.conf;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.logging.Logger;

/**
 * Defines the settings used by the Niord Proxy.
 * The following system properties can be used to initialize the settings:
 * <ul>
 *     <li>niord-proxy.server : The full URL of the back-end Niord server</li>
 * </ul>
 */
@Singleton
public class Settings {

    @Inject
    Logger log;

    // URL of the Niord server
    private String server;

    private String areaId;

    /** Constructor **/
    @PostConstruct
    private void init() {
        // Initialize settings from system properties

        server = System.getProperty("niord-proxy.server", "https://niord.e-navigation.net");
        log.info("server: " + server);

        areaId = System.getProperty("niord-proxy.area", "urn:mrn:iho:country:dk"); // Denmark in Niord
        log.info("AreaId: " + areaId);
    }

    public String getServer() {
        return server;
    }

    public String getAreaId() {
        return areaId;
    }
}
